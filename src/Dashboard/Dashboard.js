import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

import { PersonFill, PencilSquare } from 'react-bootstrap-icons';

import "./Dashboard.scss";

import { auth, db, logout } from "../firebase";

import { updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { doc, addDoc, deleteDoc, Timestamp} from 'firebase/firestore'
import { query, collection, getDocs, where } from "firebase/firestore";
import { orderBy, onSnapshot } from "firebase/firestore"
import ReactPlayer from 'react-player'

import { 
  Nav, Navbar, Container, 
  Row, Col, Button, Card, 
  Form, NavDropdown, Modal,
  InputGroup, ButtonGroup
} from 'react-bootstrap';

function Dashboard() {
    const [user, loading, error] = useAuthState(auth);
    const [name, setName] = useState("");
    const [userId, setUserId] = useState("");
    const [documents, setDocuments] = useState([]);
    const [users, setUsers] = useState([]);
    const [email, setEmail] = useState("");

    const [modalStatus, setModalStatus] = useState("");
    const [show, setShow] = useState(false);
    const [docId, setDocId] = useState("");
    
    const navigate = useNavigate();
    const fetchUserData = async () => {
        try {
            const q1 = query(collection(db, "users"), where("uid", "==", user?.uid));
            const doc = await getDocs(q1);
            const data = doc.docs[0].data();
            setName(data.name);
            setUserId(data.uid);
            const q2 = query(collection(db, 'documents'), orderBy('created', 'desc'))
            onSnapshot(q2, (querySnapshot) => {
                setDocuments(
                    querySnapshot.docs
                    .filter(doc=>doc.data().userIds.includes(data.uid))
                    .map(doc => ({
                        id: doc.id,
                        data: doc.data()
                    }))
                )
            })
        } catch (err) {
            console.error(err);
            alert("An error occured while fetching user data");
        }
    };

    function timeConverter(UNIX_timestamp){
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate() < 10 ? '0' + a.getDate() : a.getDate();
        var hour = a.getHours() < 10 ? '0' + a.getHours() : a.getHours();
        var min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
        var sec = a.getSeconds() < 10 ? '0' + a.getSeconds() : a.getSeconds();
        var time = year + '/' + month + '/' + date + ' ' + hour + ':' + min + ':' + sec ;
        return time;
    }


    useEffect(() => {
        if (loading) return;
        if (!user) return navigate("../login");
        fetchUserData();
    }, [user, loading]);


    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleSubmit = async (e, addDocument) => {
        console.log(addDocument)
        e.preventDefault()
        try {
            await addDoc(collection(db, 'documents'), {
                ...addDocument,
                created: Timestamp.now()
            })
        // onClose()
        } catch (err) {
            alert(err)
        }
    }

    const handleRemove = async (e, docId) => {
        console.log(docId)
        e.preventDefault()
        try {
            await deleteDoc(doc(db, "documents", docId));
        } catch (err) {
            alert(err)
        }
    }
    

    useEffect(() => {
        if(modalStatus==="派發"){
            const q = query(collection(db, 'users'))
            onSnapshot(q, (querySnapshot) => {
                setUsers(
                    querySnapshot.docs
                    .filter(doc=>doc.data().email === email)
                    .map(doc => ({
                        id: doc.id,
                        data: doc.data()
                    }))
                )
            })
        }
    },[email])
    
    const handleShare = async (e) => {
        e.preventDefault()
        let userId = users[0].data.uid
        console.log(userId, email, docId)
        try {
            const docRef = doc(db, "documents", docId);
            await updateDoc(docRef, {
                userIds: arrayUnion(userId)
            });
        } catch (err) {
            alert(err)
        }
    }

    return (
        <div className='app'>
            <Modal show={show} onHide={handleClose} animation={false}>
                <Modal.Header closeButton>
                    {
                        modalStatus === "新增" && <Modal.Title>新增文件</Modal.Title> 
                    }
                    {
                        modalStatus === "派發" && <Modal.Title>派發文件</Modal.Title> 
                    }
                    {
                        modalStatus === "刪除" && <Modal.Title>刪除文件</Modal.Title> 
                    }
                </Modal.Header>
                <Modal.Body className="h-auto">
                    {
                        modalStatus === "新增" 
                        && 
                        <Modal.Title>
                            <Form className="d-flex">
                                <Form.Control 
                                    id="urlVal" 
                                    type="text" 
                                    placeholder="請輸入影片網址"
                                />
                            </Form>
                        </Modal.Title>
                    }
                    {
                        modalStatus === "派發"
                        && 
                        <Modal.Title>
                            <Form className="d-flex">
                                <Form.Control 
                                    id="emailVal" 
                                    type="text" 
                                    placeholder="請輸入要派發的使用者信箱"
                                    onChange={(e)=>setEmail(e.target.value)}
                                />
                            </Form>
                        </Modal.Title>
                    }
                    {
                        modalStatus === "刪除" 
                        && 
                        <p>
                            請確認是否要刪除此文件
                        </p> 
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        關閉
                    </Button>
                    {
                        modalStatus === "新增" 
                        && 
                        <Button variant="primary" onClick={(e)=>{
                            let docId = uuidv4()
                            let url = document.getElementById("urlVal").value
                            let userIds = []
                            userIds.push(userId)
                            
                            handleSubmit(e, {url, docId, userIds})
                            handleClose()
                        }}>
                            新增
                        </Button>
                    }
                    {
                        modalStatus === "派發"
                        && 
                        <Button variant="primary" onClick={(e)=>{
                            // setEmail(document.getElementById("emailVal").value)
                            handleShare(e)
                            handleClose()
                        }}>
                            派發
                        </Button>
                    }
                    {
                        modalStatus === "刪除" 
                        && 
                        <Button variant="danger" onClick={(e)=>{
                            handleRemove(e, docId)
                            handleClose()
                        }}>
                            刪除
                        </Button>
                    }
                </Modal.Footer>
            </Modal>
            <Container className='container-wrapper d-flex flex-column'>
                <Navbar collapseOnSelect expand="lg" bg="light" variant="light" className='navbar-section rounded mb-3'>
                    <Container>
                        <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
                        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                        <Navbar.Collapse id="responsive-navbar-nav">
                            <Nav.Link 
                                onClick={()=>{
                                    setModalStatus("新增")
                                    handleShow()
                                }} 
                                className="pe-2 text-dark"
                            >
                                <PencilSquare /> 新增文件
                            </Nav.Link>
                            <Nav className="ms-auto">
                                <Nav.Link href="#" disabled className="ps-2 text-dark">
                                    <PersonFill /> {name}
                                </Nav.Link>
                                <Nav.Link href="#" onClick={logout}  className="ps-0">
                                    登出
                                </Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                        
                    </Container>
                </Navbar>
                <Row id="main-section">
                    <Col 
                        xs={12} 
                        className="pe-3 d-flex flex-column"
                    >
                        <Col
                            xs={12} 
                            className="player-wrapper border rounded p-3 flex-wrap"
                        >
                            {
                                documents.sort((a,b)=> (a.data.created.seconds - b.data.created.seconds)).map((documentObj, index, arr) => {
                                let {id, data} = documentObj
                                let {docId, url, userIds, created} = data
                                return (
                                    <Col xs={6} className="p-3 d-flex flex-column" key={index}>
                                        <p className="mb-2 text-black">於 {timeConverter(Number(created.seconds))} 創建</p>
                                        <ReactPlayer
                                            className='react-player'
                                            width='100%'
                                            height='200px'
                                            url={url}
                                            playing={false}
                                            controls={true}
                                            light={true}
                                        />
                                        <Col className="d-flex" xs={12}>
                                            <Col className="pe-1">
                                                <Button 
                                                    className="w-100"
                                                    variant="primary"
                                                    onClick={()=>navigate(`../ducument/${docId}?url=${url}`)}
                                                >前往文件</Button>
                                            </Col>
                                            <Col className={`${userIds[0]===userId?"px-1":"ps-1"}`}>
                                                <Button 
                                                    className="w-100"
                                                    variant="success"
                                                    onClick={()=>{
                                                        setModalStatus("派發")
                                                        setDocId(id)
                                                        handleShow()
                                                    }}
                                                >派發文件</Button>
                                            </Col>
                                            <Col 
                                                className={`ps-1 ${userIds[0]===userId?"":"d-none"}`}
                                            >
                                                <Button 
                                                    className="w-100"
                                                    variant="danger"
                                                    onClick={(e)=>{
                                                        setModalStatus("刪除")
                                                        setDocId(id)
                                                        handleShow()
                                                    }}
                                                >刪除文件</Button>
                                            </Col>
                                        </Col>
                                        
                                    </Col>
                                )})
                            }
                        </Col>

                    </Col>
                </Row>
            </Container>
        </div>
        // <div className="dashboard">
        //     <div className="dashboard__container">
        //         Logged in as
        //         <div>{name}</div>
        //         <div>{user?.email}</div>
        //         <button className="dashboard__btn" onClick={logout}>
        //         Logout
        //         </button>
        //     </div>
        // </div>
    );
}
export default Dashboard;
