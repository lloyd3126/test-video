import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Container, Row, Col, Button, Card, ListGroup, Modal} from 'react-bootstrap';
import { CaretDownFill } from 'react-bootstrap-icons';
import ReactPlayer from 'react-player'
import Duration from './Duration'

import './reset.css'
import './defaults.css'
import './Demo1.scss'

function App(){
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=5e9y5AH8a_g");
  const [playing, setPlaying] = useState(true);
  const [controls, setControls] = useState(false);
  const [light, setLight] = useState(true);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(true);
  const [rangeInputWidth, setRangeInputWidth] = useState(0);
  const [duration, setDuration] = useState(0);
  const [nowQuestion, setNowQuestion] = useState(0);
  const [clickPreviewOrNot, setClickPreviewOrNot] = useState(false);
  const [status, setStatus] = useState("start");
  const [questions, setQuestions] = useState([
    {
      time: "00:00:20",
      question: '請問你喜歡這支影片嗎？',
      options: ['喜歡', '不喜歡'],
      answer: ''
    },
    {
      time: "00:02:00",
      question: '請問雷夢是小男生還是小女生？',
      options: ['男生', '女生'],
      answer: ''
    },
    {
      time: "00:03:00",
      question: '請問要略過廣告嗎？',
      options: ['要略過', '不要略過'],
      answer: ''
    },
    {
      time: "00:13:09",
      question: '請問是機器人嗎？',
      options: ['是機器人', '不是機器人'],
      answer: ''
    }
  ]);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  
  const reactPlayerRef = useRef();

  let handlePlayPause = () => {
    setPlaying(!playing)
  }

  let handleStop = () => {
    console.log("handleStop")
    setUrl(null)
    setPlaying(false)
    setPlayed(0)
    setDuration(0)
  }

  let handlePlay = () => {
    console.log('onPlay')
    setPlaying(true)
    console.log(played)
    setStatus("play")
  }

  let handlePause = () => {
    console.log('onPause')
    setPlaying(false)
  }

  let handleSeekMouseDown = () => {
    setSeeking(true)
  }

  let handleSeekChange = (e) => {
    setPlayed(parseFloat(e.target.value))
  }

  let handleSeekMouseUp = (e) => {
    setSeeking(false)
    reactPlayerRef.current.seekTo(parseFloat(e.target.value))
  }

  let handleProgress = state => {
    let {played} = state;
    setPlayed(played)
    console.log("handleProgress")
    let seconds = played * duration
    let format = (seconds) => {
      const date = new Date(seconds * 1000)
      const hh = date.getUTCHours()
      const mm = date.getUTCMinutes()
      const ss = pad(date.getUTCSeconds())
      return `${pad(hh)}:${pad(mm)}:${ss}`
    }
    let pad = (string) => {
      return ('0' + string).slice(-2)
    }

    if(questions.map(question=>question.time).includes(format(seconds))){
      let nowQuestionIdx = questions.findIndex(question => {
        let {time} = question
        return time === format(seconds)
      })
      setNowQuestion(nowQuestionIdx)
      console.log("------->",nowQuestion)
      setPlaying(false)
      setStatus("open")
    }
    
    let {offsetWidth} = document.querySelector("#rangeInput")
    setRangeInputWidth(offsetWidth)

  }

  let handleEnded = () => {
    console.log('onEnded')
    setPlaying(false)
  }

  let handleDuration = (duration) => {
    console.log('onDuration', duration)
    setDuration(duration)
  }

  let handleClickPreview = () => {
    console.log('onClickPreview')
    setClickPreviewOrNot(true)
  }

  let handleReplay = () => {
    console.log("handleReplay")
    setUrl("https://www.youtube.com/watch?v=5e9y5AH8a_g")
    setPlaying(true)
    setStatus("start")
  }

  let totalSeconds = (time) => {
      let date = new Date("2000-01-01 " + time)
      return date.getHours()*60*60 + date.getMinutes()*60 + date.getSeconds()
    }

  let getPlayedValue = (time, duration) => parseFloat(totalSeconds(time) / duration);

  return (
    <div className='app'>
        <Container className="pxt-4 px-3">
          <Row className="mt-3">
            <Col className='position-relative'>
              <div className='player-wrapper'>
                <ReactPlayer
                  className='react-player'
                  width='100%'
                  height='100%'
                  ref={reactPlayerRef}
                  url={url}
                  playing={playing}
                  controls={controls}
                  light={light}
                  onReady={() => console.log('onReady')}
                  onStart={() => console.log('onStart')}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onBuffer={() => console.log('onBuffer')}
                  onSeek={e => console.log('onSeek', e)}
                  onEnded={handleEnded}
                  onError={e => console.log('onError', e)}
                  onProgress={handleProgress}
                  onDuration={handleDuration}
                  onClickPreview={handleClickPreview}
                />
              </div>
              <div 
                className={
                  "player-cover " + 
                  "position-absolute " + 
                  (!clickPreviewOrNot ? 'd-none' : 'd-block')
                }
              >
                { 
                  status === "open" 
                  &&
                  <div className={
                    "card-wrap "+
                    "d-flex justify-content-center align-items-center"
                  }>
                    <Card className="shadow">
                      <Card.Header className='p-2 px-5'>問題 {nowQuestion + 1}</Card.Header>
                      <Card.Body>
                        <Card.Title className='mb-3 p-2 px-5'>{questions[nowQuestion].question}</Card.Title>
                          {
                            questions[nowQuestion].options.map((option, index, arr) => {
                              return (
                                <ListGroup>
                                  <ListGroup.Item 
                                    key={index} 
                                    className={ `p-2 px-5 ${
                                      questions[nowQuestion].answerId === index
                                      ? 
                                      'chosen ' : ''}`+
                                      `${index === arr.length - 1 ? '' : 'mb-2 '}`
                                    }
                                    onClick={
                                      () => {
                                        let newQuestions = [...questions]
                                        newQuestions[nowQuestion].answer = option
                                        newQuestions[nowQuestion].answerId = index
                                        setQuestions(newQuestions)
                                      }
                                    }
                                  >
                                    {option}
                                  </ListGroup.Item>
                                </ListGroup>
                              )
                            })
                          }
                        <hr />
                        <Button 
                          type="button" 
                          className="btn-secondary w-100"
                          onClick={()=>{
                            setPlayed(Math.floor(played*duration+1)/duration)
                            reactPlayerRef.current.seekTo(Math.floor(played*duration+2)/duration)
                            setStatus("play")
                            setPlaying(true)
                          }}
                        >
                          繼續播放
                        </Button>
                      </Card.Body>
                    </Card>
                  </div>
                }
              </div>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col>
                <div className="control-section p-3 px-4">
                  <Row className="mb-2">
                    <Col className="fs-6 text-start">
                      <Duration seconds={duration * played} />
                    </Col>
                    <Col className="fs-6 text-end">
                      <Duration seconds={duration} />
                    </Col>
                  </Row>
                  <Row 
                    className={played?"d-block":"d-none"}>
                    <Col 
                      id="bookmark-section"
                      style={{
                      width: `${rangeInputWidth-16}px`
                    }}
                      >
                      {
                        questions.map((question, index) => {
                          return (
                            <div 
                              className="bookmark" 
                              key={index}
                              
                              style={{
                                left: `${String(getPlayedValue(question.time, duration)*100)}%`
                              }}
                              >
                              <CaretDownFill />
                            </div>
                            )
                          })
                        }
                    </Col>
                  </Row>
                  <Row className="mb-2">
                    <Col>
                      <input
                        type='range' min={0} max={0.999999} step='any'
                        value={played}
                        id="rangeInput"
                        className="w-100"
                        onMouseDown={(e)=>{handleSeekMouseDown(e)}}
                        onChange={(e)=>{handleSeekChange(e)}}
                        onMouseUp={(e)=>{handleSeekMouseUp(e)}}
                      />
                      {/* <progress max={1} value={played} /> */}
                    </Col>
                    
                  </Row>
                  <Row>
                    <Col className="pe-2">
                      <Button 
                        variant="light" 
                        className={ `w-100 ${status === "start" ? 'disabled' : ''}`}
                        onMouseDown={handleStop}
                        onMouseUp={handleReplay}
                      >
                        重頭播放
                      </Button>
                    </Col>
                    <Col className="px-2">
                      <Button 
                        variant="light" 
                        className={ `w-100 ${status === "start" ? 'disabled' : ''}`}
                        onClick={handlePlayPause}
                      >
                        {
                          !playing && clickPreviewOrNot ? 
                            '播放' 
                            : 
                            (!clickPreviewOrNot ? '播放' :'暫停')
                        }
                      </Button>
                    </Col>
                    <Col className="px-2">
                      <Button 
                        variant="light"
                        className={ `w-100 ${status === "start" ? 'disabled' : ''}`}
                        onClick={()=>{
                          handleShow()
                          setPlaying(false)
                        }}
                      >
                        題目清單
                      </Button>
                      <Modal show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                          <Modal.Title>問題清單</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="modal-body p-4">
                          <p>共有 {questions.length} 題，點擊下方各題後可以直接前往作答。</p>
                          {
                            questions.map((question, index) => {
                              return (
                                <ListGroup
                                  key={index} 
                                >
                                  <ListGroup.Item 
                                    className={`p-3 postion-relative ` +
                                      `${index === questions.length - 1 ? '' : 'mb-3 '}`
                                    }
                                    onClick={
                                      () => {
                                        setNowQuestion(index)
                                        handleClose()
                                        reactPlayerRef.current.seekTo(getPlayedValue(question.time, duration))
                                        setPlaying(false)
                                        setStatus("open")
                                      }
                                    }
                                  >
                                    <p className="timeText m-3">{question.time}</p>
                                    <p className="mb-2">問題 {index + 1}</p>
                                    <p className="mb-2">問題：{question.question}</p>
                                    <p 
                                      className={`m-0 ${question.answer === "" ? 'redColor ' : ''}`}
                                    >答案：{question.answer===""?"尚未作答":question.answer}</p>
                                  </ListGroup.Item>
                                </ListGroup>
                              )
                            })
                          }
                        </Modal.Body>
                        <Modal.Footer>
                          <Button variant="secondary" onClick={handleClose}>
                            關閉
                          </Button>
                          <Button variant="primary" onClick={handleClose}>
                            送出表單
                          </Button>
                        </Modal.Footer>
                      </Modal>
                    </Col>
                    <Col className="ps-2">
                      <Button 
                        variant="light"
                        className={ `w-100 
                          ${
                            status === "start" ||
                            questions.map(question=>question["answer"]).includes("") 
                            ? 
                            'disabled' : ''
                          }
                        `}
                      >
                        送出表單
                      </Button>
                    </Col>
                  </Row>  
                </div>
            </Col>
          </Row>
        </Container>
      </div>
  );
}

export default App
