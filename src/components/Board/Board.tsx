import styles from "./Board.module.css";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import Badge from "react-bootstrap/Badge";

import { GiBuffaloHead } from "react-icons/gi";

import Button from "react-bootstrap/Button";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

import {
  ThemeColor,
  Header,
  BoardGame,
  TypeSwitcher,
  TypesData as typesData,
} from "../";

interface BoardType {
  theme: string;
  setTheme: Function;
}

const Board = ({ theme, setTheme }: BoardType) => {
  const shuffle = (arr: number[]) => {
    let ctr = arr.length;
    let index;

    while (ctr > 0) {
      index = Math.floor(Math.random() * ctr);
      ctr--;
      [arr[ctr], arr[index]] = [arr[index], arr[ctr]];
    }
    return arr;
  };
  let wait = new Audio("https://www.myinstants.com/media/sounds/chan.swf.mp3");
  let win = new Audio(
    "https://www.myinstants.com/media/sounds/mlg-airhorn.mp3"
  );

  const [switchType, setSwitchType] = useState<boolean>(
    JSON.parse(window.localStorage.getItem("switchType") || "false")
  );
  const [type, setType] = useState<number[]>(
    JSON.parse(window.localStorage.getItem("type") || "[0,0]")
  );
  const [auto, setAuto] = useState<boolean>(
    JSON.parse(window.localStorage.getItem("auto") || "false")
  );
  const [full, setFull] = useState<boolean>(
    JSON.parse(window.localStorage.getItem("full") || "false")
  );
  const [genNumbers, setGenNumbers] = useState<number[]>(
    JSON.parse(
      window.localStorage.getItem("genNumbers") ||
        JSON.stringify(shuffle(Array.from({ length: 90 }, (_, i) => i + 1)))
    )
  );
  const [showGen, setShowGen] = useState<boolean>(
    JSON.parse(window.localStorage.getItem("showGen") || "false")
  );
  const [genNumberIndex, setGenNumberIndex] = useState<number>(
    JSON.parse(window.localStorage.getItem("genNumberIndex") || "0")
  );
  const [speed, setSpeed] = useState<number>(
    JSON.parse(window.localStorage.getItem("speed") || "1")
  );

  const audio = (url: string, newSpeed?: number) => {
    let res = new Audio(url);
    res.playbackRate = newSpeed ?? speed;
    return res;
  };
  const [nextAudio, setNextAudio] = useState<typeof wait>(
    audio(
      `./audio/${
        genNumbers[
          JSON.parse(window.localStorage.getItem("genNumberIndex") || "0") + 1
        ]
      }.mp3`,
      speed
    )
  );

  const board = (data: number[][]) =>
    data.map((row) => {
      let i = 0;
      let newRow = [];
      for (let j = 0; j < 9; ++j) {
        if (Math.floor(row[i] / 10) === j || (j === 8 && row[i] === 90)) {
          newRow.push({
            value: row[i],
            clicked: false,
          });
          ++i;
        } else {
          newRow.push({
            value: 0,
            clicked: false,
          });
        }
      }
      return newRow;
    });
  const [boardData, setBoardData] = useState<BoardDataType[][]>(
    JSON.parse(
      window.localStorage.getItem("boardData") ||
        JSON.stringify(board(typesData[type[0]][type[1]]))
    )
  );
  const [history, setHistory] = useState<BoardDataType[][][]>([
    board(typesData[type[0]][type[1]]),
  ]);
  const [time, setTime] = useState<number>(0);
  useEffect(() => {
    window.localStorage.setItem("boardData", JSON.stringify(boardData));
    window.localStorage.setItem("time", JSON.stringify(time));
    window.localStorage.setItem("history", JSON.stringify(history));
    window.localStorage.setItem("speed", JSON.stringify(speed));
    window.localStorage.setItem(
      "genNumberIndex",
      JSON.stringify(genNumberIndex)
    );
    window.localStorage.setItem("genNumbers", JSON.stringify(genNumbers));
    window.localStorage.setItem("auto", JSON.stringify(auto));
    window.localStorage.setItem("type", JSON.stringify(type));
    window.localStorage.setItem("full", JSON.stringify(full));
    window.localStorage.setItem("switchType", JSON.stringify(switchType));
    window.localStorage.setItem("showGen", JSON.stringify(showGen));
  });

  const countClick = (row: BoardDataType[]) => {
    let res = 0;
    for (let x of row) if (x.clicked) ++res;
    return res;
  };

  const reset = (newAuto?: boolean) => {
    setBoardData(history[0]);
    setHistory([history[0]]);
    setTime(0);
    setShowGen(false);
    setFull(false);
    if (newAuto ?? auto) {
      const temp = shuffle(genNumbers);
      setGenNumbers(temp);
      setGenNumberIndex(0);
      audio(`./audio/${temp[0]}.mp3`, speed).play();
      autoClick(temp[0], history[0]);
      setNextAudio(audio(`./audio/${temp[1]}.mp3`));
    }
  };

  const undo = () => {
    let newTime = time - 1;
    if (newTime >= 0) {
      newTime < history.length && setBoardData(history[newTime]);
      setTime(newTime);
    }
  };

  const redo = () => {
    let newTime = time + 1;
    if (newTime < history.length) {
      newTime >= 0 && setBoardData(history[newTime]);
      setTime(newTime);
    }
  };

  const onClickItem = (ir: number, ic: number, clicked: boolean) => {
    let newBoardData = boardData.map((row, i) =>
      row.map((x, j) => {
        if (i === ir && j === ic) {
          return { ...x, clicked: !clicked };
        }
        return x;
      })
    );
    setTime(history.length);
    setHistory([...history, newBoardData]);
    if (!clicked) {
      let count = countClick(boardData[ir]);
      if (count === 3) {
        wait.play();
      } else if (count === 4) {
        win.play();
      }
    }
    setBoardData(newBoardData);
  };

  const onClickType = (i: number, j: number) => {
    setType([i, j]);
    setBoardData(board(typesData[i][j]));
    setHistory([board(typesData[i][j])]);
    setSwitchType(false);
    setTime(0);
    setShowGen(false);
    setFull(false);
    if (auto) {
      const temp = shuffle(genNumbers);
      setGenNumbers(temp);
      setGenNumberIndex(0);
      audio(`./audio/${temp[0]}.mp3`, speed).play();
      autoClick(temp[0], history[0]);
      setNextAudio(audio(`./audio/${temp[1]}.mp3`));
    }
  };
  const autoClick = (num: number, pre: typeof boardData | null) => {
    let newBoardData = (pre ?? boardData).map((row, i) =>
      row.map((x, j) => {
        if (num === x.value) {
          let count = countClick(boardData[i]);
          if (count === 4) {
            win.play();
          }
          return { ...x, clicked: true };
        }
        return x;
      })
    );
    setBoardData(newBoardData);
  };
  const startAutoPlay = () => {
    reset();
    setAuto(true);
    audio(`./audio/${genNumbers[0]}.mp3`).play();
    autoClick(genNumbers[0], history[0]);
    setNextAudio(audio(`./audio/${genNumbers[1]}.mp3`));
  };
  const stopAutoPlay = () => {
    reset(false);
    setAuto(false);
    setGenNumbers(shuffle(genNumbers));
    setGenNumberIndex(0);
  };

  const play = () => {
    nextAudio.play();
    autoClick(genNumbers[genNumberIndex + 1], null);
    setGenNumberIndex(genNumberIndex + 1);
    const root: HTMLElement | undefined =
      document.getElementById("fullscreen") ?? undefined;
    if (genNumberIndex + 2 === 90) {
      setFull(true);
      Swal.fire({
        title: "Đã kêu hết bộ cờ, chơi ván mới?",
        target: root,
        text: "Xóa hết các nước đi của ván này và chơi ván mới!",
        showCancelButton: true,
        confirmButtonText: "Chơi",
        cancelButtonText: "Không",
      }).then((result) => {
        result.isConfirmed && reset();
      });
    } else {
      setNextAudio(audio(`./audio/${genNumbers[genNumberIndex + 2]}.mp3`));
    }
  };
  const toggleShow = () => {
    setShowGen(!showGen);
  };
  const increaseSpeed = () => {
    if (speed < 3) {
      setSpeed(speed + 0.2);
      setNextAudio(
        audio(`./audio/${genNumbers[genNumberIndex + 1]}.mp3`, speed + 0.2)
      );
    }
  };
  const decreaseSpeed = () => {
    if (speed > 0.6) {
      setSpeed(speed - 0.2);
      setNextAudio(
        audio(`./audio/${genNumbers[genNumberIndex + 1]}.mp3`, speed - 0.2)
      );
    }
  };
  return (
    <div>
      {auto && (
        <div className={styles.speedBtn}>
          <Button
            className={styles.increaseSpeed}
            variant={theme}
            onClick={() => increaseSpeed()}
          >
            <FaArrowUp></FaArrowUp>
          </Button>
          <Button variant={theme} onClick={() => decreaseSpeed()}>
            <FaArrowDown></FaArrowDown>
          </Button>
        </div>
      )}
      <div
        className={styles.genNumberContainer}
        style={{ backgroundColor: ThemeColor[theme === "light" ? 0 : 1] }}
      >
        <Badge variant={theme} className={styles.badge}>
          {auto ? (
            <span className={styles.genNumber}>
              {genNumbers[genNumberIndex]}
            </span>
          ) : (
            <GiBuffaloHead className={styles.genNumber}></GiBuffaloHead>
          )}
        </Badge>
      </div>
      <div
        className={styles.container}
        style={{ backgroundColor: ThemeColor[theme === "light" ? 0 : 1] }}
      >
        <Header
          {...{
            setSwitchType,
            type,
            theme,
            setTheme,
            reset,
            undo,
            redo,
            switchType,
            auto,
            startAutoPlay,
            stopAutoPlay,
            play,
            toggleShow,
            full,
          }}
        />
        {!switchType ? (
          <BoardGame
            {...{
              boardData,
              theme,
              onClickItem,
              type,
              genNumbers,
              genNumberIndex,
              showGen,
              auto,
            }}
          />
        ) : (
          <TypeSwitcher
            {...{
              onClickType,
              type,
              theme,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Board;
