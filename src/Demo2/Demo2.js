import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthState } from "react-firebase-hooks/auth";

import { 
  Nav, Navbar, Container, 
  Row, Col, Button, Card, 
  Form, NavDropdown, 
  InputGroup, ButtonGroup
} from 'react-bootstrap';

import ReactPlayer from 'react-player'
import Duration from '../Duration'

import '../reset.css'
import './Demo2.scss'

import {
  auth,
  db,
  signInWithGoogle,
  logInWithEmailAndPassword,
  registerWithEmailAndPassword,
  sendPasswordReset,
  logout
} from '../firebase'


import {collection, addDoc, Timestamp} from 'firebase/firestore'
import {query, orderBy, onSnapshot} from "firebase/firestore"
import {getDocs, where} from "firebase/firestore";


function App(){
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState("");
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [url, setUrl] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({
    time: "",
    author: "",
    message: "",
    url: ""
  });

  let { docId } = useParams();
  let mainSecSize = useWindowSize("main-section");
  let sendBoxSize = useWindowSize("sendBox");
  
  const reactPlayerRef = useRef();

  const [searchParams, setSearchParams] = useSearchParams();

  const fetchUserData = async () => {
        try {
            const q = query(collection(db, "users"), where("uid", "==", user?.uid));
            const doc = await getDocs(q);
            const data = doc.docs[0].data();
            setName(data.name);
        } catch (err) {
            console.error(err);
            alert("An error occured while fetching user data");
        }
    };

  useEffect(() => {
        if (loading) return;
        if (!user) return navigate("../login");
        fetchUserData();
  }, [user, loading]);

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
    document.getElementById("urlVal").value = ""
    document.getElementById("urlVal").value = searchParams.get("url")
    if(searchParams.get("url")){
      setUrl(searchParams.get("url"))
      setNewMessage({
        ...newMessage,
        url: `${searchParams.get("url")}`,
      })
    }else{
      setUrl("")
      setNewMessage({
      ...newMessage,
      url: "",
    })
    }
    
  },[])

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('created', 'desc'))
    onSnapshot(q, (querySnapshot) => {
      setMessages(
        querySnapshot.docs
        .filter(doc=>doc.data().docId === docId)
        .filter(doc=>doc.data().url === url)
        .map(doc => ({
          id: doc.id,
          data: doc.data()
        }))
      )
    })
  },[url])

  

  return (
    <div className='app'>
      <Container className='container-wrapper'>
        <Navbar collapseOnSelect expand="lg" bg="light" variant="light" className='navbar-section rounded mb-3'>
          <Container>
            <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              
              <Nav className="ms-auto">
                <Nav.Link href="../dashboard" className="text-black">返回</Nav.Link>
              </Nav>
            </Navbar.Collapse>
            
          </Container>
        </Navbar>
        <Row id="main-section">
          <Col 
            xs={8} 
            className="pe-3 d-flex flex-column"
          >
            <Col
              xs={12} 
              className={"border rounded p-3 mb-3 bg-white "+
                (searchParams.get("url")?"d-none":"d-block")}
            >
              <Form className="d-flex">
                <Form.Control 
                  id="urlVal" 
                  type="text" 
                  placeholder="影片網址" 
                  onChange={()=>{
                    setUrl(`${document.getElementById("urlVal").value}`)
                    setNewMessage({
                      ...newMessage,
                      url: `${document.getElementById("urlVal").value}`,
                    })
                  }}
                />
              </Form>
            </Col>
            <Col
              xs={12} 
              className="player-wrapper2 border rounded p-3"
            >
              <ReactPlayer
                  className='react-player mb-0'
                  width='100%'
                  height='100%'
                  ref={reactPlayerRef}
                  url={url}
                  playing={playing}
                  controls={true}
                  light={false}
                  onError={e => console.log('onError', e)}
                  onBufferEnd={() => {
                    console.log('onBufferEnd')

                  }}
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
            </Col>
            
          </Col>
          <Col 
            xs={4} 
            className="message-wrapper ps-0" 
            style={{
                height: `${mainSecSize.height}px`
            }}
          >
            <Col id="sendBox" className="sendBox mb-3 border rounded p-3">
              <>
                <Row>
                  <Col xs={12} >
                    <Form.Control 
                      id="authorVal" 
                      type="text" 
                      placeholder="標注人" 
                      value = {name}
                      disabled
                    />
                  </Col>

                  <Col xs={12} className="mt-2">
                    {/* <Form.Label className="text-dark">要標注的時間：</Form.Label> */}
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
                      id="messageVal"
                      as="textarea"
                      placeholder="標注說明"
                      onChange={()=>{
                        setNewMessage({
                          ...newMessage,
                          time: `${document.getElementById("hourVal").value}:${document.getElementById("minuteVal").value}:${document.getElementById("secondVal").value}`,
                          message: `${document.getElementById("messageVal").value}`,
                          author: `${document.getElementById("authorVal").value}`
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
                            handleSubmit(e, 
                              {
                                time: `${document.getElementById("hourVal").value}:${document.getElementById("minuteVal").value}:${document.getElementById("secondVal").value}`,
                                message: `${document.getElementById("messageVal").value}`, 
                                author: `${document.getElementById("authorVal").value}`,
                                url: `${document.getElementById("urlVal").value}`,
                                docId, 
                                type: "請求"
                              }
                            )
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
                            handleSubmit(e, 
                              {
                                time: `${document.getElementById("hourVal").value}:${document.getElementById("minuteVal").value}:${document.getElementById("secondVal").value}`,
                                message: `${document.getElementById("messageVal").value}`, 
                                author: `${document.getElementById("authorVal").value}`,
                                url: `${document.getElementById("urlVal").value}`,
                                docId, 
                                type: "回應"
                              }
                            )
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
            <Col 
              className="p-3 pe-4 rounded"
              id="messages-section"
              style={{
                height: `calc(${mainSecSize.height - sendBoxSize.height}px - 1rem)`
              }}
            >
              {
                messages.sort((a,b)=> (a.data.url - b.data.url || totalSeconds(a.data.time) - totalSeconds(b.data.time) || a.data.created - b.data.created)).map((messageObj, index, arr) => {
                  let {id, data} = messageObj
                  let {created, time, url, author, message, type} = data
                  created = created.seconds

                  return (
                    <Card 
                      key={id}
                      className={
                        "messageBox mb-3 " + 
                        (
                          arr
                            .filter(e=>totalSeconds(e.data.time)===totalSeconds(time))
                            .sort((a,b)=> (a.data.created.seconds - b.data.created.seconds))
                            .findIndex(e=>e.id===id) === 0 ? 'w-100' : 'w-80'
                        )
                      }
                      onMouseDown={
                        ()=>{
                          setUrl(url)
                          setPlaying(true)
                          setNewMessage({
                            ...newMessage,
                            url: `${document.getElementById("urlVal").value}`,
                          })
                          document.getElementById("urlVal").value = url
                        }
                      }
                      onMouseUp={
                        ()=>{
                          setPlaying(false)
                          reactPlayerRef.current.seekTo(getPlayedValue(time, duration))
                          document.getElementById("hourVal").value = Math.floor(totalSeconds(time) / 3600)
                          document.getElementById("minuteVal").value = Math.floor(totalSeconds(time) % 3600 / 60)
                          document.getElementById("secondVal").value = Math.floor(totalSeconds(time) % 3600 % 60 )
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

// Hook
function useWindowSize(idSelector) {

  

  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [nodeSize, setNodeSize] = useState({
    width: undefined,
    height: undefined,
  });
  
  useEffect(() => {
    // Handler to call on window resize
    const node = document.getElementById(idSelector)
    function handleResize() {
      console.log(node)
      console.log(node.offsetHeight)
      // Set window width/height to state
      setNodeSize({
        width: node.offsetrWidth,
        height: node.offsetHeight,
      });
      
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize(node));
  }, [idSelector]); // Empty array ensures that effect is only run on mount
  return nodeSize;
}



export default App
