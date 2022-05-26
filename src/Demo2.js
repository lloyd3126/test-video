import React, { useState, useEffect, useRef } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  NavLink,
  useSearchParams,
  useParams,
} from 'react-router-dom';


import { Navbar, Container, Row, Col, Button, Card, FloatingLabel, Form, InputGroup, FormControl, ButtonGroup} from 'react-bootstrap';
import { CaretDownFill } from 'react-bootstrap-icons';
import ReactPlayer from 'react-player'
import Duration from './Duration'

import './reset.css'
import './defaults.css'
import './Demo2.scss'

import {db} from './firebase'
import {collection, addDoc, Timestamp} from 'firebase/firestore'
import {query, orderBy, onSnapshot} from "firebase/firestore"

function App(){
  const [url, setUrl] = useState("");
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({
    time: "",
    author: "",
    message: "",
    url: ""
  });

  let { userId } = useParams();
    
  const reactPlayerRef = useRef();

  let handleDuration = (duration) => {
    console.log('onDuration', duration)
    setDuration(duration)
  }

  let handleProgress = state => {
    let {played} = state;
    setPlayed(played)
    console.log("handleProgress")
    document.getElementById("hourVal").value = Math.floor(reactPlayerRef.current.getCurrentTime() / 3600)
    document.getElementById("minuteVal").value = Math.floor(reactPlayerRef.current.getCurrentTime() % 3600 / 60)
    document.getElementById("secondVal").value = Math.floor(reactPlayerRef.current.getCurrentTime() % 3600 % 60 )
  }

  let totalSeconds = (time) => {
      let date = new Date("2000-01-01 " + time)
      return date.getHours()*60*60 + date.getMinutes()*60 + date.getSeconds()
    }

  let getPlayedValue = (time, duration) => parseFloat(totalSeconds(time) / duration);

  const handleSubmit = async (e, addMessage) => {
    e.preventDefault()
    console.log(e)
    console.log(addMessage)
    try {
      await addDoc(collection(db, 'messages'), {
        ...addMessage,
        created: Timestamp.now()
      })
      // onClose()
    } catch (err) {
      alert(err)
    }
  }

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('created', 'desc'))
    onSnapshot(q, (querySnapshot) => {
      setMessages(querySnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      })))
    })
  },[])

  return (
    <div className='app'>
        <Container className='container-wrapper'>
          <Row>
            <Col 
              xs={8} 
              className="player-wrapper"
            >
              <ReactPlayer
                  className='react-player mb-3 '
                  width='100%'
                  height='100%'
                  ref={reactPlayerRef}
                  url={url}
                  playing={playing}
                  controls={true}
                  light={false}
                  onError={e => console.log('onError', e)}
                  onBufferEnd={() => {
                    console.log('onBufferEnd')}
                  }
                  onBuffer={(state) => {
                    console.log('onBuffer')
                    let played = reactPlayerRef.current.getCurrentTime()
                    document.getElementById("hourVal").value = Math.floor(played / 3600)
                    document.getElementById("minuteVal").value = Math.floor(played % 3600 / 60)
                    document.getElementById("secondVal").value = Math.floor(played % 3600 % 60 )
                  }}
                  onProgress={handleProgress}
                  onDuration={handleDuration}
                />
                <div className="descriptionBox border rounded p-3">
                  <Col xs={10} className="pe-2">
                    <Form.Control 
                      id="urlVal" 
                      type="text" 
                      placeholder="url" 
                      onChange={()=>{
                        setUrl(`${document.getElementById("urlVal").value}`)
                        setNewMessage({
                          ...newMessage,
                          url: `${document.getElementById("urlVal").value}`,
                        })
                      }}
                    />
                  </Col>
                  <Col xs={2}>
                    <Button 
                      className={"w-100"}
                      variant="secondary" 
                      type="submit"
                    >
                      設定
                    </Button>
                  </Col>
                </div>
            </Col>
            <Col xs={4} className="message-wrapper ps-0">
              
              <Col xs={12} className="sendBox mb-3 border rounded p-3">
                <>
                  <Row>
                    <Col xs={12}>
                      <Form.Label className="text-dark">要標注的時間：</Form.Label>
                      <InputGroup className="text-center">
                        <Form.Control id="hourVal" type="number" placeholder="" min={0} />
                        <InputGroup.Text id="basic-addon1">時</InputGroup.Text>
                        <Form.Control id="minuteVal" type="number" placeholder="" min={0} max={60} />
                        <InputGroup.Text id="basic-addon2">分</InputGroup.Text>
                        <Form.Control id="secondVal" type="number" placeholder="" min={0} max={60} />
                        <InputGroup.Text id="basic-addon3">秒</InputGroup.Text>
                      </InputGroup>
                    </Col> 

                    <Col xs={12} className="mt-2">
                      <Form.Control 
                        id="authorVal" 
                        type="text" 
                        placeholder="發表人" 
                        onChange={()=>{
                          setNewMessage({
                            ...newMessage,
                            time: `${document.getElementById("hourVal").value}:${document.getElementById("minuteVal").value}:${document.getElementById("secondVal").value}`,
                            author: `${document.getElementById("authorVal").value}`
                          })
                        }}
                      />
                    </Col>

                    <Col xs={12} className="mt-2">
                      <Form.Control
                        id="messageVal"
                        as="textarea"
                        placeholder="評論"
                        style={{ height: '150px' }}
                        onChange={()=>{
                          setNewMessage({
                            ...newMessage,
                            time: `${document.getElementById("hourVal").value}:${document.getElementById("minuteVal").value}:${document.getElementById("secondVal").value}`,
                            message: `${document.getElementById("messageVal").value}`
                          })
                        }}
                      />
                    </Col>
                    <Col xs={12} className="mt-2">
                      <ButtonGroup className="w-100">
                        <Button 
                          className={"w-100"}
                          disabled={Object.values(newMessage).includes("")}
                          variant="danger" 
                          type="submit"
                          onClick={
                            (e)=>{
                              handleSubmit(e, {...newMessage, userId, type: "請求"})
                            }
                          }
                        >
                          送出請求
                        </Button>

                        <Button 
                          className={"w-100"}
                          disabled={Object.values(newMessage).includes("")}
                          variant="success" 
                          type="submit"
                          onClick={
                            (e)=>{
                              handleSubmit(e, {...newMessage, userId, type: "回應"})
                            }
                          }
                        >
                          送出回應
                        </Button>
                        
                      </ButtonGroup>
                      
                    </Col>
                  </Row>
                  
                </>
              </Col>
              <Col className="messages-section p-3 pe-4  border rounded">
                {
                  messages.sort((a,b)=> (totalSeconds(a.data.time) - totalSeconds(b.data.time) || a.data.created - b.data.created)).map((messageObj, index, arr) => {
                    let {id, data} = messageObj
                    let {created, time, url, author, message, type} = data
                    created = created.seconds

                    return (
                      <Card 
                        key={created}
                        className={
                          "messageBox mb-3 " + 
                          (
                            arr
                              .filter(e=>totalSeconds(e.data.time)===totalSeconds(time))
                              .sort((a,b)=> (a.data.created.seconds - b.data.created.seconds))
                              .findIndex(e=>e.id===id) === 0 ? 'w-100' : 'w-80'
                          )
                        }
                        onClick={
                          ()=>{
                            setUrl(url)
                            reactPlayerRef.current.seekTo(getPlayedValue(time, duration))
                            document.getElementById("hourVal").value = Math.floor(totalSeconds(time) / 3600)
                            document.getElementById("minuteVal").value = Math.floor(totalSeconds(time) % 3600 / 60)
                            document.getElementById("secondVal").value = Math.floor(totalSeconds(time) % 3600 % 60 )
                            document.getElementById("urlVal").value = url
                            setNewMessage({
                              ...newMessage,
                              url: `${document.getElementById("urlVal").value}`,
                            })
                            setPlaying(false)
                          }
                        }
                      >
                        <Card.Body>
                          <Row className="mb-1">
                            <Col>
                              <p 
                                className={
                                  "m-0 " + 
                                  (type === "請求" ? 'text-danger' : '') + 
                                  (type === "回應" ? 'text-success' : '') 
                                }
                              >{author}{type}</p>
                            </Col>
                            <Col>
                              <p className="m-0 timeTxt">{
                                `${Number(time.split(":")[0])} 時 ${Number(time.split(":")[1])} 分 ${Number(time.split(":")[2])} 秒 `
                              }</p>
                            </Col>
                          </Row>
                          <p className="m-0">{message}</p>
                          <p style={
                            {
                              fontSize: "5px"
                            }
                          } className="m-0">{url}</p>
                        </Card.Body>
                      </Card>
                    )
                  })
                }
              </Col>
            </Col>
          </Row>
        </Container>
      </div>
  );
}


export default App
