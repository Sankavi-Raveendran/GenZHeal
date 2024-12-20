import React, { useState, useRef, useEffect } from 'react';
import { FaCog, FaCalendarAlt, FaFilm, FaComments, FaSignOutAlt, FaTachometerAlt, FaUsers, FaRegFileAlt, FaFileAlt } from 'react-icons/fa';
import docimg from "../../images/doctor.png";
import p1img from "../../images/patient1.jpeg";
import p2img from "../../images/patient2.png";
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Chatting from './Chatting';
import "./FileUpload.css";
import axios from 'axios';
import { jsPDF } from 'jspdf';
import dotenv from "dotenv";


const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [isEditVFormVisible, setEditVFormVisible] = useState(false);
  const [editVData, setEditVData] = useState();
  const [isEditDFormVisible, setEditDFormVisible] = useState(false);
  const [editDData, setEditDData] = useState({
    docName: '',
    date: '',
    docum: null,
  });
  const [file, setFile] = useState(null);
  const [docName, setDocName] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [date, setDate] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [selectedVirualId, setSelectedVirualId] = useState(null);
  const [selectedDocId, setSelectedDocId] = useState(null);

  const [allVirual, setAllVirual] = useState([]);
  const [allDoc, setAllDoc] = useState([]);
  const [transcriptionText, setTranscriptionText] = useState("");
  const [file_audio, setFile_audio] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [appointments, setAppointments] = useState([]);

  const setAppointmentsData = (data) => {
    // Map through each appointment and conditionally modify the email field
    const updatedData = data.map((appointment) => {
      if (appointment.type !== "Normal") {
        // If appointment type is not "Normal", hide the email
        return {
          ...appointment,
          email: undefined
        };
      }
      return appointment; // Otherwise, keep the original data
    });

    setAppointments(updatedData);
  };



  // Fetch appointments from the backend API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/appointment/getAppointment');
        setAppointmentsData(response.data);
        console.log(response.data);
      } catch (err) {
        console.log(err.message);
      } finally {
      }
    };

    fetchAppointments();
  }, []);

  // Function to handle status change
  const updateStatus = async (id, status) => {
    try {
      const response = await axios.put(`http://localhost:3000/api/appointment/update-status/${id}`, {
        status: status, // 'Accepted' or 'Rejected'
      });
      // Update appointment list with new status
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === id ? { ...appointment, status: status } : appointment
        )
      );
      console.log(response.data);
    } catch (err) {
      console.error(err.message);
    }
  };


  useEffect(() => {
    fetch("http://localhost:3000/api/virualclub/all-virual").then(
      res => res.json()
    ).then(data => setAllVirual(data))
  }, [])


  const handleDelete = (id) => {
    console.log(id);
    fetch(`http://localhost:3000/api/virualclub/delete-virual/${id}`, {
      method: "DELETE",
    }).then(res => res.json()).then(data => {
      const updatedNewTableVirual = allVirual.filter(table => table._id !== id);
      setAllVirual(updatedNewTableVirual);
      toast.success('Virtual is Deleted Successfully');

    }).catch(err => {
      console.error(err);
      toast.error('An error occurred');
    });


  }


  useEffect(() => {
    fetch("http://localhost:3000/api/documents/all-doc").then(
      res => res.json()
    ).then(data => setAllDoc(data))

  }, [])

  const handleDeleteDoc = (id) => {
    console.log(id);
    fetch(`http://localhost:3000/api/documents/delete-doc/${id}`, {
      method: "DELETE",
    }).then(res => res.json()).then(data => {
      const updatedNewTableDoc = allDoc.filter(table => table._id !== id);
      setAllDoc(updatedNewTableDoc);
      toast.success('Document is Deleted Successfully');

    }).catch(err => {
      console.error(err);
      toast.error('An error occurred');
    });


  }
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileChange_audio = (e) => {
    setFile_audio(e.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    setFile(droppedFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleConvertToText = async () => {
    if (!file_audio) {
      alert('Please choose or drop a file to transcribe.');
      return;
    }

    setIsConverting(true);

    const formData = new FormData();
    formData.append('file', file_audio);
    formData.append('model', 'whisper-1');


    const apiKey = process.env.OPENAI_API_KEY;

    try {
      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      setTranscriptionText(response.data.text);
      const slicedText = response.data.text.slice(0, 900);

      await handleTextEncryptor(slicedText);
    } catch (error) {
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else {
        console.error('Error message:', error.message);
      }
    } finally {
      setIsConverting(false);
    }
  };


  const generatePDF = (text) => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const textWidth = pageWidth - 2 * margin;

    const wrappedText = doc.splitTextToSize(text, textWidth);

    doc.text(wrappedText, margin, 10)

    doc.save('sample.pdf');
  };


  const handleTextEncryptor = async (transcriptionText) => {
    const apiKey = process.env.OPENAI_API_KEY;

    try {
      const response = await axios.post(
        'https://api.aphroheragames.com/chat',
        {
          api_key: apiKey,
          user_input: `${transcriptionText} replace with the word "[hidden]" any personal information like names, and give back as same. Do not do any other changes.`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );


      setTranscriptionText(response.data.response);
      generatePDF(response.data.response);
    } catch (error) {
      console.error('Error during anonymization:', error.response ? error.response.data : error.message);
    }
  };




  const toggleEditVForm = () => {


    setEditVFormVisible(!isEditVFormVisible);

  };

  const toggleEditDForm = () => {

    setEditDFormVisible(!isEditDFormVisible);

  };

  const handleOpenEditForm = (data) => {
    setEditVData(data)
    setEditVFormVisible(true)
    console.log(data);
  }

  const handleOpenEditDForm = (data) => {
    console.log(data);
    setEditDData(data);
    setEditDFormVisible(true);
  };





  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditVData({ ...editVData, [name]: value });
  };


  const handleDInputChange = (e) => {
    const { name, type, value, files } = e.target;
    if (type === 'file') {
      setEditDData((prevData) => ({
        ...prevData,
        [name]: files[0],
      }));
    } else {
      setEditDData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };




  const handleSave = () => {

    toggleEditVForm();
  };
  const handleDSave = () => {
    toggleEditDForm();
  };



  const virualCategories = [
    "Video",
    "Article",
    "Audio"
  ]


  const virualTypes = [
    "Educational",
    "Self-Help Support",
    "Therapeutic Exercises",
    "Personal Stories"

  ]


  const [selectedVirualCategory, setselectedVirualCategory] = useState(virualCategories[0])
  const [selectedVirualType, setselectedVirualType] = useState(virualTypes[0])

  const handleChangeSelectedValue = (e) => {
    setselectedVirualCategory(e.target.value)
    console.log(e.target.value);
  }

  const handleChangeSelectedType = (e) => {
    setselectedVirualType(e.target.value)
    console.log(e.target.value);
  }

  const handleVirualSubmit = (e) => {
    e.preventDefault();
    const form = e.target;

    const title = form.documentName.value;
    const content = form.content.value;
    const type = form.documentType.value;
    const image = form.imageLink.value;
    const link = form.documentURL.value;
    const category = form.categoryName.value;

    const virtualObj = {
      title, content, type, image, link, category
    }

    console.log(virtualObj);


    fetch("http://localhost:3000/api/virualclub/upload-virual", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(virtualObj)
    }).then(res => res.json()).then(data => {
      toast.success("VirualClub Items are Uploaded")
      setAllVirual([...allVirual, data]);
    }).finally(() => setShowForm(false))
  }


  const handleSubmitUpdate = () => {


    fetch(`http://localhost:3000/api/virualclub/update-virual/${editVData._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editVData)
    }).then(res => res.json()).then((data) => {
      const updatedAllVirual = allVirual.map(vir => vir._id === data._id ? data : vir)
      setAllVirual(updatedAllVirual)
    }).catch(() => alert('Something wrong')).finally(() => setEditVFormVisible(false))
  }


  const handleDocSubmit = (e) => {
    e.preventDefault();
    const form = e.target;


    const docName = form.docName.value;
    const date = form.date.value;
    const docum = form.docum.files[0];


    console.log("Form data before submission:");
    console.log("docName:", docName);
    console.log("date:", date);
    console.log("docum (file):", docum);

    const formData = new FormData();
    formData.append('docName', docName);
    formData.append('date', date);
    formData.append('pdf', docum);

    console.log("FormData object:", formData);

    fetch("http://localhost:3000/api/documents/upload-doc", {
      method: "POST",
      body: formData,
    })
      .then((res) => {

        console.log("Server response status:", res.status);
        console.log("Server response headers:", res.headers);


        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        } else {
          throw new Error('Response is not JSON');
        }
      })
      .then((data) => {

        console.log("Server response data:", data);
        toast.success("Documents are uploaded");


        setAllDoc([...allDoc, data.data]);
      })
      .catch((error) => {

        console.error("Error during document upload:", error);
        alert('Something went wrong during the document upload');
      })
      .finally(() => {
        setShowForm(false);
      });
  };



  const handleSubmitdocUpdate = () => {
    console.log(editDData);

    if (!editDData._id) {
      console.error('Document ID is missing');
      return;
    }

    const formData = new FormData();
    formData.append('docName', editDData.docName);
    formData.append('date', editDData.date);
    formData.append('pdf', editDData.docum);

    fetch(`http://localhost:3000/api/documents/update-doc/${editDData._id}`, {
      method: 'PUT',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        const updatedAllDoc = allDoc.map((docu) => (docu._id === data._id ? data : docu));
        setAllDoc(updatedAllDoc);
      })
      .catch(() => alert('Something went wrong'))
      .finally(() => setEditDFormVisible(false));
  };

  const [patients, setPatients] = useState([]);


  useEffect(() => {
    axios.get('http://localhost:3000/api/user/profile')
      .then((response) => {
        // Store the correct data in the patients state
        if (Array.isArray(response.data)) {
          setPatients(response.data); // If data is already an array
          console.log("pat",); // Check what the API returns
        } else if (response.data && Array.isArray(response.data.patients)) {
          setPatients(response.data.patients); // Access patients array
        }
      })
      .catch((error) => {
        console.error('Error fetching user profiles:', error);
      });
  }, []);





  const appointmentRef = useRef(null);
  const dashboardRef = useRef(null);
  const messagesRef = useRef(null);
  const patientsRef = useRef(null);
  const documentsRef = useRef(null);
  const settingsRef = useRef(null);
  const virtualclubRef = useRef(null);

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const navigateTo = (section) => {
    setActiveSection(section);
    switch (section) {
      case 'dashboard':
        dashboardRef.current.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'appointment':
        appointmentRef.current.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'messages':
        messagesRef.current.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'patients':
        patientsRef.current.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'documents':
        documentsRef.current.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'virtualclub':
        virtualclubRef.current.scrollIntoView({ behavior: 'smooth' });
        break;
      default:
        break;
    }

  };
  const data = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        label: 'Number of Patients',
        data: [12, 19, 3, 5, 2, 3, 10],
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };



  return (
    <div className="h-full h-screen overflow-y-auto pt-0 mt-0">

      <nav className="fixed">

      </nav>


      <div className="flex h-full ">


        <aside className="bg-gray-200 w-64 p-4 mt-0 pt-0 h-full fixed">

          <img
            width="600"
            height="600"
            src={docimg}
            alt="Doctor"
            className="mx-auto rounded-full"
          />

          <div className="ml-4 text-lg">
            <h4>Dr. S. Suthakaran</h4>
            <br />
            <ul>
              <li className="mb-4">
                <button className="flex items-center w-full text-left p-2 rounded hover:bg-gray-300" onClick={() => navigateTo('dashboard')}>
                  <FaTachometerAlt className="Icon" />
                  <span>Dashboard</span>
                </button>
              </li>


              <li className="mb-4">
                <button className="flex items-center w-full text-left p-2 rounded hover:bg-gray-300" onClick={() => navigateTo('appointment')}>
                  <FaCalendarAlt className="Icon" />
                  <span>Appointment</span>
                </button>
              </li>

              <li className="mb-4">
                <button className="flex items-center w-full text-left p-2 rounded hover:bg-gray-300" onClick={() => navigateTo('messages')}>
                  <FaComments className="Icon" />
                  <span>Messages</span>
                </button>
              </li>

              <li className="mb-4">
                <button className="flex items-center w-full text-left p-2 rounded hover:bg-gray-300" onClick={() => navigateTo('patients')}>
                  <FaUsers className="Icon" />
                  <span>Patients</span>
                </button>
              </li>

              <li className="mb-4">
                <button className="flex items-center w-full text-left p-2 rounded hover:bg-gray-300" onClick={() => navigateTo('documents')}>
                  <FaRegFileAlt className="Icon" />
                  <span>Documents</span>
                </button>
              </li>

              <li className="mb-4">
                <button className="flex items-center w-full text-left p-2 rounded hover:bg-gray-300" onClick={() => navigateTo('virtualclub')}>
                  <FaFilm className="Icon" />
                  <span>virtualclub</span>
                </button>
              </li>
              <li className="mb-4">
                <button className="flex items-center w-full text-left p-2 rounded hover:bg-gray-300" onClick={() => navigateTo('logout')}>
                  <FaSignOutAlt className="Icon" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </aside>




        <section className="ml-80 mt-0 pt-0 h-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


          <div ref={dashboardRef} className={`${activeSection === 'dashboard' ? 'block' : 'hidden'}`} >
            <div class="pt-24">
              <h1>Hello! Mr.S.Suthakaran</h1>
              <p>Welcome to the  GenZheal dashboard.</p>

              <div class="flex justify-between space-x-4">
                <div class="mb-9 w-64 rounded-xl py-8 px-7 shadow-lg transition-all hover:shadow-lg sm:p-9 lg:px-6 xl:px-9 overflow-hidden">
                  <div class="flex flex-col items-start">
                    <div class="flex items-center">
                      <FaUsers className="text-2xl mr-2" />
                      <p class="text-xl font-bold text-black">
                        Patients
                      </p>
                    </div>
                    <p class="text-xl font-bold text-black mt-2">{`${patients.length}`}</p>
                  </div>
                </div>
                <div class="mb-9 w-64 rounded-xl py-8 px-7 shadow-lg transition-all hover:shadow-lg sm:p-9 lg:px-6 xl:px-9 overflow-hidden">
                  <div class="flex flex-col items-start">
                    <div class="flex items-center">
                      <FaCalendarAlt className="text-2xl mr-2" />
                      <p class="text-xl font-bold text-black">
                        Appointments
                      </p>
                    </div>
                    <p class="text-xl font-bold text-black mt-2">{`${appointments.length}`}</p>
                  </div>
                </div>
                <div class="mb-9 w-64 rounded-xl py-8 px-7 shadow-lg transition-all hover:shadow-lg sm:p-9 lg:px-6 xl:px-9 overflow-hidden">
                  <div class="flex flex-col items-start">
                    <div class="flex items-center">
                      <FaFileAlt className="text-2xl mr-2" />
                      <p class="text-xl font-bold text-black">
                        Documents
                      </p>
                    </div>
                    <p class="text-xl font-bold text-black mt-2">{`${allDoc.length}`}</p>
                  </div>
                </div>
                <div class="mb-9 w-64 rounded-xl py-8 px-7 shadow-lg transition-all hover:shadow-lg sm:p-9 lg:px-6 xl:px-9 overflow-hidden">
                  <div class="flex flex-col items-start">
                    <div class="flex items-center">
                      <FaFilm className="text-2xl mr-2" />
                      <p class="text-xl font-bold text-black">
                        Virtual contents
                      </p>
                    </div>
                    <p class="text-xl font-bold text-black mt-2">{`${allVirual.length}`}</p>
                  </div>
                </div>
              </div>

              <div className="file-upload-container" onDrop={handleDrop} onDragOver={handleDragOver}>
                <div className="file-upload-box" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <input type="file" accept="audio/*" id="file-input" onChange={handleFileChange_audio} />
                  <label htmlFor="file-input">

                    {/* <button className="choose-files-button" style={{ margin: '20px 0' }}>
                      <i className="icon">📄</i> Choose Files
                    </button> */}
                  </label>
                  <p>Drop files here!</p>
                  <p className="terms">to convert the audio files to a Word file.</p>
                  <button onClick={handleConvertToText} disabled={isConverting} style={{ marginTop: '20px' }}>
                    {isConverting ? 'Converting...' : 'Click here convert to Text !'}
                  </button>
                </div>
              </div>

              {/* <button onClick={handleConvertToText} disabled={isConverting} style={{ marginTop: '20px' }}>
                {isConverting ? 'Converting...' : 'Convert to Text'}
              </button> */}

            </div>

            <div class="flex ">
              <div className="w-full px-2">
                <div className="w-full px-2">
                  <div class="mb-9 rounded-xl py-8 px-7 shadow-lg transition-all hover:shadow-lg sm:p-9 lg:px-6 xl:px-9 overflow-hidden">

                    <div class="flex justify-between mb-2">
                      <h3 class="text-xl font-bold text-black sm:text-2xl lg:text-xl xl:text-2xl">
                        Appointments
                      </h3>
                      {/* <button class="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                        Edit
                      </button> */}
                    </div>

                    <div className="admin-appointment-table-container container mx-auto px-4 sm:px-6 lg:px-8 h-72 overflow-y-auto">
                      {appointments.length === 0 ? (
                        <p>No appointments found</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white border-collapse">
                            <thead>
                              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Appointment Id</th>
                                <th className="py-3 px-6 text-left">Appointment Date</th>
                                <th className="py-3 px-6 text-left">Type</th>
                                <th className="py-3 px-6 text-left">Session Number</th>
                                <th className="py-3 px-6 text-left">Action</th>
                              </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-light">
                              {appointments.map((appointment) => (
                                <tr key={appointment._id} className="border-b border-gray-200 hover:bg-gray-100">
                                  <td className="py-3 px-6 text-left whitespace-nowrap">{appointment.appointmentId}</td>
                                  <td className="py-3 px-6 text-left whitespace-nowrap">{new Date(appointment.appointmentDate).toLocaleDateString()}</td>
                                  <td className="py-3 px-6 text-left">{appointment.type}</td>
                                  <td className="py-3 px-6 text-left">{appointment.sessionNumber}</td>
                                  <td className="py-3 px-6 text-left">
                                    {appointment.status === 'Pending' ? (
                                      <>
                                        <button
                                          className="mr-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                          onClick={() => updateStatus(appointment._id, 'Accepted')}
                                        >
                                          Accept
                                        </button>
                                        <button
                                          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                          onClick={() => updateStatus(appointment._id, 'Rejected')}
                                        >
                                          Reject
                                        </button>
                                      </>
                                    ) : (
                                      <span>{appointment.status}</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>

              {/* <div className="w-full px-2">
                <div className="w-full px-2">
                  <div class="mb-9 rounded-xl py-8 px-7 shadow-lg transition-all hover:shadow-lg sm:p-9 lg:px-6 xl:px-9 overflow-hidden">

                    <div class="flex justify-between mb-2">
                      <h3 class="text-xl font-bold text-black sm:text-2xl lg:text-xl xl:text-2xl">
                        Messages
                      </h3>
                      <button class="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                        Edit
                      </button>
                    </div>

                    <div class="h-72 overflow-y-auto">
                      <div class="w-full px-2 mb-2 mt-4">
                        <div class="flex items-center rounded-xl transition-all bg-blue-100 sm:p-2 xl:px-3">
                          <img
                            width="30"
                            src={p1img}
                            alt="patient1"
                            className="rounded-full mr-3"
                          />
                          <p class="text-base font-medium text-body-color">Sankavi</p>
                          <span class="inline-block bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center ml-auto mr-2">1</span>
                        </div>
                      </div>

                      <div class="w-full px-2 mb-2 mt-4">
                        <div class="flex items-center rounded-xl transition-all bg-blue-100 sm:p-2 xl:px-3">
                          <img
                            width="30"
                            src={p1img}
                            alt="patient1"
                            className="rounded-full mr-3"
                          />
                          <p class="text-base font-medium text-body-color">Sankavi</p>
                          <span class="inline-block bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center ml-auto mr-2">1</span>
                        </div>
                      </div>

                      <div class="w-full px-2 mb-2 mt-4">
                        <div class="flex items-center rounded-xl transition-all bg-blue-100 sm:p-2 xl:px-3">
                          <img
                            width="30"
                            src={p1img}
                            alt="patient1"
                            className="rounded-full mr-3"
                          />
                          <p class="text-base font-medium text-body-color">Sankavi</p>
                          <span class="inline-block bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center ml-auto mr-2">1</span>
                        </div>
                      </div>

                      <div class="w-full px-2 mb-2 mt-4">
                        <div class="flex items-center rounded-xl transition-all bg-blue-100 sm:p-2 xl:px-3">
                          <img
                            width="30"
                            src={p1img}
                            alt="patient1"
                            className="rounded-full mr-3"
                          />
                          <p class="text-base font-medium text-body-color">Sankavi</p>
                          <span class="inline-block bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center ml-auto mr-2">1</span>
                        </div>
                      </div>

                      <div class="w-full px-2 mb-2 mt-4">
                        <div class="flex items-center rounded-xl transition-all bg-blue-100 sm:p-2 xl:px-3">
                          <img
                            width="30"
                            src={p1img}
                            alt="patient1"
                            className="rounded-full mr-3"
                          />
                          <p class="text-base font-medium text-body-color">Sankavi</p>
                          <span class="inline-block bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center ml-auto mr-2">1</span>
                        </div>
                      </div>

                      <div class="w-full px-2 mb-2 mt-4">
                        <div class="flex items-center rounded-xl transition-all bg-blue-100 sm:p-2 xl:px-3">
                          <img
                            width="30"
                            src={p1img}
                            alt="patient1"
                            className="rounded-full mr-3"
                          />
                          <p class="text-base font-medium text-body-color">Sankavi</p>
                          <span class="inline-block bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center ml-auto mr-2">1</span>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              </div> */}
            </div>

            <div class="w-full px-2">
              <div class="mb-9 rounded-xl py-8 px-7 shadow-lg transition-all hover:shadow-lg sm:p-9 lg:px-6 xl:px-9">

                <div class="flex justify-between mb-2">
                  <h3 class="text-xl font-bold text-black sm:text-2xl lg:text-xl xl:text-2xl">
                    Patients
                  </h3>
                  {/* <button class="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                    Edit
                  </button> */}
                </div>

                <div className="flex flex-wrap -mx-4 overflow-x-auto space-x-8 pb-4 px-4">
                    {/* Mapping through the patients array to display each patient */}
                    {patients.map((patient, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center rounded-xl transition-all bg-blue-100 sm:p-2 xl:px-3 shadow-md shadow-gray-500 flex-shrink-0 mx-4 mb-4"
                      >
                        {/* Display the first letter of the patient's username */}
                        <div
                          className="flex items-center justify-center bg-blue-500 text-white font-bold rounded-full mb-3"
                          style={{ width: "100px", height: "100px", fontSize: "40px" }}
                        >
                          {patient.username.charAt(0).toUpperCase()}
                        </div>

                        <p className="text-base font-medium text-body-color mb-1">
                          {patient.username}
                        </p>
                      </div>
                    ))}
                  </div>
              </div>
            </div>

            <div className="w-full">
              <div className="mb-9 rounded-xl py-8 px-7 shadow-lg transition-all hover:shadow-lg sm:p-9 lg:px-6 xl:px-9 overflow-hidden">
                <div className="flex justify-between mb-2">
                  <h3 className="text-xl font-bold text-black sm:text-2xl lg:text-xl xl:text-2xl">
                    Documents
                  </h3>
                  {/* <button
                    onClick={toggleForm}
                    className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                  >
                    Add file
                  </button> */}
                </div>



                {showForm && (
                  <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                      </div>

                      <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                      <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <form className="mt-4" onSubmit={handleDocSubmit}>
                          <div className="mb-4">
                            <label htmlFor="docName" className="block text-sm font-medium text-gray-700">
                              Patient Name
                            </label>
                            <input
                              type="text"
                              id="docName"
                              name="docName"
                              value={editDData?.docName}
                              // onChange={(e) => setDocName(e.target.value)}
                              onChange={handleDInputChange}
                              className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div className="mb-4">
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                              Date
                            </label>
                            <input
                              type="date"
                              id="date"
                              name="date"
                              value={editDData?.date}
                              // onChange={(e) => setDate(e.target.value)}
                              onChange={handleDInputChange}
                              className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div className="mb-4">
                            <label htmlFor="docum" className="block text-sm font-medium text-gray-700">
                              Document
                            </label>
                            <input
                              type="file"
                              id="docum"
                              name="docum"
                              accept=".pdf,.doc,.docx"
                              // value={editDData?.docum}
                              // onChange={handleFileChange}
                              onChange={handleDInputChange}

                              className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div className="mb-8">
                            <button type="submit"

                              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={toggleForm}
                              type="button"
                              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                <div className="h-auto">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Patient Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            document
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Edit</span>
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Delete</span>
                          </th>
                        </tr>
                      </thead>
                      {allDoc.map((doc, index) => (
                        <tbody className="bg-white divide-y divide-gray-200" key={doc._id}>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900"> {doc.docName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{doc.date}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-500">
                                {doc.docum}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button onClick={() => handleOpenEditDForm(doc)} className="text-indigo-600 hover:text-indigo-900">
                                Edit
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button onClick={() => handleDeleteDoc(doc._id)} className="text-indigo-600 hover:text-indigo-900">
                                Delete
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      ))}
                      {isEditDFormVisible && (
                        <div className="fixed z-50 inset-0 overflow-y-auto">
                          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity">
                              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>

                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                                      Edit Details
                                    </h3>
                                    <form className="mt-4" onSubmit={(e) => e.preventDefault()}>
                                      <div className="mb-4">
                                        <label htmlFor="documentName" className="block text-sm font-medium text-gray-700">
                                          Patient Name
                                        </label>
                                        <input
                                          type="text"
                                          id="docName"
                                          name="docName"
                                          onChange={handleDInputChange}
                                          value={editDData.docName}

                                          className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                      </div>
                                      <div className="mb-4">
                                        <label htmlFor="documentURL" className="block text-sm font-medium text-gray-700">
                                          Date
                                        </label>
                                        <input
                                          type="date"
                                          id="date"
                                          onChange={handleDInputChange}
                                          name="date"
                                          value={editDData.date}

                                          className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                      </div>

                                      <div className="mb-4">
                                        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                                          Document
                                        </label>
                                        <input
                                          type="file"
                                          id="docum"
                                          name="docum"
                                          accept=".pdf,.doc,.docx"

                                          onChange={handleDInputChange}
                                          className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                      </div>

                                    </form>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                  onClick={handleSubmitdocUpdate}
                                  type="button"
                                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={toggleEditDForm}
                                  type="button"
                                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full ">
              <div className="mb-9 rounded-xl py-8 px-7 shadow-lg transition-all hover:shadow-lg sm:p-9 lg:px-6 xl:px-9 overflow-hidden">
                <div className="flex justify-between mb-2">
                  <h3 className="text-xl font-bold text-black sm:text-2xl lg:text-xl xl:text-2xl">
                    Virtualclub
                  </h3>
                  {/* <button
                    onClick={toggleForm}
                    className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                  >
                    Add file
                  </button> */}
                </div>

                {/* Toggleable Form */}

                {showForm && (
                  <div className="fixed z-50 inset-2 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                      <div className="fixed inset-0 transition-opacity">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                      </div>

                      <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;

                      <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                          <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                                Add Document
                              </h3>
                              <form className="mt-4" onSubmit={handleVirualSubmit} >
                                <div className="mb-4">
                                  <label htmlFor="documentName" className="block text-sm font-medium text-gray-700">
                                    Document Name
                                  </label>
                                  <input
                                    type="text"
                                    id="documentName"
                                    name="documentName"
                                    className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                  />
                                </div>
                                <div className="mb-4">
                                  <label htmlFor="documentURL" className="block text-sm font-medium text-gray-700">
                                    Document URL
                                  </label>
                                  <input
                                    type="text"
                                    id="documentURL"
                                    name="documentURL"
                                    className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                  />
                                </div>
                                <div className="mb-4">
                                  <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
                                    Document Type
                                  </label>
                                  <select
                                    id="documentType"
                                    name="documentType"
                                    value={selectedVirualType}
                                    onChange={handleChangeSelectedType}
                                    className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                  >
                                    {
                                      virualTypes.map((option) => <option key={option} value={option}>{option}</option>)
                                    }
                                  </select>
                                </div>
                                <div className="mb-4">
                                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                    Category
                                  </label>
                                  <select
                                    id="categoryName"
                                    name="categoryName"
                                    value={selectedVirualCategory}
                                    onChange={handleChangeSelectedValue}
                                    className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                  >
                                    {
                                      virualCategories.map((option) => <option key={option} value={option}>{option}</option>)
                                    }
                                  </select>
                                </div>
                                <div className="mb-4">
                                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                                    Content
                                  </label>
                                  <textarea
                                    id="content"
                                    name="content"
                                    rows="4"
                                    className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                  />
                                </div>
                                <div className="mb-4">
                                  <label htmlFor="imageLink" className="block text-sm font-medium text-gray-700">
                                    Image Link
                                  </label>
                                  <input
                                    type="text"
                                    id="imageLink"
                                    name="imageLink"
                                    className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                  />
                                </div>



                                <button
                                  type="submit"
                                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={toggleForm}
                                  type="button"
                                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                  Cancel
                                </button>



                              </form>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}


                <div class="h-72 overflow-y-auto">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Document Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            document
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            document type
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Edit</span>
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">delete</span>
                          </th>
                        </tr>
                      </thead>
                      {
                        allVirual.map((virual, index) =>

                          <tbody className="bg-white divide-y divide-gray-200" key={virual._id}>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{virual.title}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{virual.link}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-500">
                                  {virual.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-500">
                                  {virual.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">

                                <button onClick={() => handleOpenEditForm(virual)} className="text-indigo-600 hover:text-indigo-900">
                                  Edit
                                </button>
                                {/* </Link> */}

                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => handleDelete(virual._id)} className="text-indigo-600 hover:text-indigo-900">
                                  Delete
                                </button>
                              </td>
                            </tr>  </tbody>
                        )
                      }

                      {isEditVFormVisible && (
                        <div className="fixed z-50 inset-0 overflow-y-auto">
                          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity">
                              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>

                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                                      Edit Document
                                    </h3>
                                    <form className="mt-4" onSubmit={(e) => e.preventDefault()}>
                                      <div className="mb-4">
                                        <label htmlFor="documentName" className="block text-sm font-medium text-gray-700">
                                          Document Name
                                        </label>
                                        <input
                                          type="text"
                                          id="documentName"
                                          name="title"
                                          onChange={handleInputChange}
                                          value={editVData.title}

                                          className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                      </div>
                                      <div className="mb-4">
                                        <label htmlFor="documentURL" className="block text-sm font-medium text-gray-700">
                                          Document URL
                                        </label>
                                        <input
                                          type="text"
                                          id="documentURL"
                                          onChange={handleInputChange}
                                          name="link"
                                          value={editVData.link}

                                          className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                      </div>
                                      <div className="mb-4">
                                        <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
                                          Document Type
                                        </label>
                                        <select
                                          id="documentType"
                                          name="type"
                                          value={editVData.type}
                                          onChange={handleInputChange}

                                          className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                          {
                                            virualTypes.map((option) => <option key={option} value={option}>{option}</option>)
                                          }
                                        </select>
                                      </div>
                                      <div className="mb-4">
                                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                          Category
                                        </label>
                                        <select
                                          id="categoryName"
                                          name="category"
                                          onChange={handleInputChange}
                                          value={editVData.category}

                                          className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                          {
                                            virualCategories.map((option) => <option key={option} value={option}>{option}</option>)
                                          }
                                        </select>
                                      </div>
                                      <div className="mb-4">
                                        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                                          Content
                                        </label>
                                        <textarea
                                          id="content"
                                          name="content"
                                          onChange={handleInputChange}
                                          value={editVData.content}
                                          rows="4"
                                          className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                      </div>
                                      <div className="mb-4">
                                        <label htmlFor="imageLink" className="block text-sm font-medium text-gray-700">
                                          Image Link
                                        </label>
                                        <input
                                          type="text"
                                          id="imageLink"
                                          name="image"
                                          onChange={handleInputChange}
                                          value={editVData.image}
                                          className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                      </div>


                                    </form>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                  onClick={handleSubmitUpdate}
                                  type="button"
                                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={toggleEditVForm}
                                  type="button"
                                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}


                    </table>
                  </div>
                </div>
              </div>
            </div>
         
          </div>


          <div class="container mx-auto px-4 sm:px-6 lg:px-8 ">
            <div ref={appointmentRef} className={`${activeSection === 'appointment' ? 'block' : 'hidden'}`}>
              <div className="w-full px-2 pt-24">
                <div class="mb-9 rounded-xl py-8 px-7 shadow-lg transition-all hover:shadow-lg sm:p-9 lg:px-6 xl:px-9 overflow-hidden">

                  <div class="flex justify-between mb-2">
                    <h3 class="text-xl font-bold text-black sm:text-2xl lg:text-xl xl:text-2xl">
                      Appointments
                    </h3>
                    {/* <button class="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                      Edit
                    </button> */}
                  </div>

                  <div className="admin-appointment-table-container container mx-auto px-4 sm:px-6 lg:px-8">
                    {appointments.length === 0 ? (
                      <p>No appointments found</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border-collapse">
                          <thead>
                            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                              <th className="py-3 px-6 text-left">Appointment Id</th>
                              <th className="py-3 px-6 text-left">Appointment Date</th>
                              <th className="py-3 px-6 text-left">Type</th>
                              <th className="py-3 px-6 text-left">Name</th>
                              <th className="py-3 px-6 text-left">Email</th>
                              <th className="py-3 px-6 text-left">Gender</th>
                              <th className="py-3 px-6 text-left">Age</th>
                              <th className="py-3 px-6 text-left">Session Number</th>
                              <th className="py-3 px-6 text-left">Payment Status</th>
                              <th className="py-3 px-6 text-left">Status</th>
                              <th className="py-3 px-6 text-left">Action</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-600 text-sm font-light">
                            {appointments.map((appointment) => (
                              <tr key={appointment._id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap">{appointment.appointmentId}</td>
                                <td className="py-3 px-6 text-left whitespace-nowrap">{new Date(appointment.appointmentDate).toLocaleDateString()}</td>
                                <td className="py-3 px-6 text-left">{appointment.type}</td>
                                <td className="py-3 px-6 text-left">{appointment.name || 'N/A'}</td>
                                <td className="py-3 px-6 text-left">{appointment.email || 'N/A'}</td>
                                <td className="py-3 px-6 text-left">{appointment.gender}</td>
                                <td className="py-3 px-6 text-left">{appointment.age}</td>
                                <td className="py-3 px-6 text-left">{appointment.sessionNumber}</td>
                                <td className="py-3 px-6 text-left">{appointment.paymentStatus ? 'Paid' : 'Pending'}</td>
                                <td className="py-3 px-6 text-left">{appointment.status}</td>
                                <td className="py-3 px-6 text-left">
                                  {appointment.status === 'Pending' ? (
                                    <>
                                      <button
                                        className="mr-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                        onClick={() => updateStatus(appointment._id, 'Accepted')}
                                      >
                                        Accept
                                      </button>
                                      <button
                                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                        onClick={() => updateStatus(appointment._id, 'Rejected')}
                                      >
                                        Reject
                                      </button>
                                    </>
                                  ) : (
                                    <span>{appointment.status}</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>


            {activeSection == "messages" && <Chatting activeSection={activeSection} messagesRef={messagesRef} />
            }


            <div ref={patientsRef} className={`${activeSection === 'patients' ? 'block' : 'hidden'}`}>
              <div className="w-full px-2 pt-24">
                <div className="mb-9 rounded-xl py-8 px-7 shadow-lg transition-all hover:shadow-lg sm:p-9 lg:px-6 xl:px-9">
                  <div className="flex justify-between mb-2">
                    <h3 className="text-xl font-bold text-black sm:text-2xl lg:text-xl xl:text-2xl">
                      Patients
                    </h3>
                    {/* <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                      Edit
                    </button> */}
                  </div>

                  <div className="flex flex-wrap -mx-4">
                    {/* Mapping through the patients array to display each patient */}
                    {patients.map((patient, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center rounded-xl transition-all bg-blue-100 sm:p-2 xl:px-3 shadow-md shadow-gray-500 flex-shrink-0 mx-4 mb-4"
                      >
                        {/* Display the first letter of the patient's username */}
                        <div
                          className="flex items-center justify-center bg-blue-500 text-white font-bold rounded-full mb-3"
                          style={{ width: "100px", height: "100px", fontSize: "40px" }}
                        >
                          {patient.username.charAt(0).toUpperCase()}
                        </div>

                        <p className="text-base font-medium text-body-color mb-1">
                          {patient.username}
                        </p>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>


            <div ref={documentsRef} className={`${activeSection === 'documents' ? 'block' : 'hidden'}`}>
              <div className="w-full pt-24">
                <div className="mb-9 rounded-xl py-8 px-7 shadow-lg transition-all hover:shadow-lg sm:p-9 lg:px-6 xl:px-9 overflow-hidden">
                  <div className="flex justify-between mb-2">
                    <h3 className="text-xl font-bold text-black sm:text-2xl lg:text-xl xl:text-2xl">
                      Documents
                    </h3>
                    <button
                      onClick={toggleForm}
                      className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                    >
                      Add file
                    </button>
                  </div>

                  {/* Toggleable Form */}

                  {showForm && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                          <form className="mt-4" onSubmit={handleDocSubmit}>
                            <div className="mb-4">
                              <label htmlFor="docName" className="block text-sm font-medium text-gray-700">
                                Patient Name
                              </label>
                              <input
                                type="text"
                                id="docName"
                                name="docName"
                                value={editDData?.docName}
                                // onChange={(e) => setDocName(e.target.value)}
                                onChange={handleDInputChange}
                                className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                            </div>
                            <div className="mb-4">
                              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                                Date
                              </label>
                              <input
                                type="date"
                                id="date"
                                name="date"
                                value={editDData?.date}
                                // onChange={(e) => setDate(e.target.value)}
                                onChange={handleDInputChange}
                                className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                            </div>
                            <div className="mb-4">
                              <label htmlFor="docum" className="block text-sm font-medium text-gray-700">
                                Document
                              </label>
                              <input
                                type="file"
                                id="docum"
                                name="docum"
                                accept=".pdf,.doc,.docx"
                                // value={editDData?.docum}
                                // onChange={handleFileChange}
                                onChange={handleDInputChange}

                                className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                            </div>
                            <div className="mb-8">
                              <button type="submit"

                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={toggleForm}
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="h-auto">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Patient Name
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Date
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              document
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Edit</span>
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Delete</span>
                            </th>
                          </tr>
                        </thead>
                        {allDoc.map((doc, index) => (
                          <tbody className="bg-white divide-y divide-gray-200" key={doc._id}>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900"> {doc.docName}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{doc.date}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-500">
                                  {doc.docum}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => handleOpenEditDForm(doc)} className="text-indigo-600 hover:text-indigo-900">
                                  Edit
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => handleDeleteDoc(doc._id)} className="text-indigo-600 hover:text-indigo-900">
                                  Delete
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        ))}
                        {isEditDFormVisible && (
                          <div className="fixed z-50 inset-0 overflow-y-auto">
                            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                              <div className="fixed inset-0 transition-opacity">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                              </div>

                              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                  <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                                        Edit Details
                                      </h3>
                                      <form className="mt-4" onSubmit={(e) => e.preventDefault()}>
                                        <div className="mb-4">
                                          <label htmlFor="documentName" className="block text-sm font-medium text-gray-700">
                                            Patient Name
                                          </label>
                                          <input
                                            type="text"
                                            id="docName"
                                            name="docName"
                                            onChange={handleDInputChange}
                                            value={editDData.docName}

                                            className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                          />
                                        </div>
                                        <div className="mb-4">
                                          <label htmlFor="documentURL" className="block text-sm font-medium text-gray-700">
                                            Date
                                          </label>
                                          <input
                                            type="date"
                                            id="date"
                                            onChange={handleDInputChange}
                                            name="date"
                                            value={editDData.date}

                                            className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                          />
                                        </div>

                                        <div className="mb-4">
                                          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                                            Document
                                          </label>
                                          <input
                                            type="file"
                                            id="docum"
                                            name="docum"
                                            accept=".pdf,.doc,.docx"

                                            onChange={handleDInputChange}
                                            className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                          />
                                        </div>

                                      </form>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                  <button
                                    onClick={handleSubmitdocUpdate}
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={toggleEditDForm}
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note */}

            <div ref={virtualclubRef} className={`${activeSection === 'virtualclub' ? 'block' : 'hidden'}`}>
              <div className="w-full pt-24">
                <div className="mb-9 rounded-xl py-8 px-7 shadow-lg transition-all hover:shadow-lg sm:p-9 lg:px-6 xl:px-9 overflow-hidden">
                  <div className="flex justify-between mb-2">
                    <h3 className="text-xl font-bold text-black sm:text-2xl lg:text-xl xl:text-2xl">
                      Virtualclub
                    </h3>
                    <button
                      onClick={toggleForm}
                      className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                    >
                      Add file
                    </button>
                  </div>

                  {/* Toggleable Form */}

                  {showForm && (
                    <div className="fixed z-50 inset-2 overflow-y-auto">
                      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity">
                          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                                  Add Document
                                </h3>
                                <form className="mt-4" onSubmit={handleVirualSubmit} >
                                  <div className="mb-4">
                                    <label htmlFor="documentName" className="block text-sm font-medium text-gray-700">
                                      Document Name
                                    </label>
                                    <input
                                      type="text"
                                      id="documentName"
                                      name="documentName"
                                      className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label htmlFor="documentURL" className="block text-sm font-medium text-gray-700">
                                      Document URL
                                    </label>
                                    <input
                                      type="text"
                                      id="documentURL"
                                      name="documentURL"
                                      className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
                                      Document Type
                                    </label>
                                    <select
                                      id="documentType"
                                      name="documentType"
                                      value={selectedVirualType}
                                      onChange={handleChangeSelectedType}
                                      className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                      {
                                        virualTypes.map((option) => <option key={option} value={option}>{option}</option>)
                                      }
                                    </select>
                                  </div>
                                  <div className="mb-4">
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                      Category
                                    </label>
                                    <select
                                      id="categoryName"
                                      name="categoryName"
                                      value={selectedVirualCategory}
                                      onChange={handleChangeSelectedValue}
                                      className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                      {
                                        virualCategories.map((option) => <option key={option} value={option}>{option}</option>)
                                      }
                                    </select>
                                  </div>
                                  <div className="mb-4">
                                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                                      Content
                                    </label>
                                    <textarea
                                      id="content"
                                      name="content"
                                      rows="4"
                                      className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label htmlFor="imageLink" className="block text-sm font-medium text-gray-700">
                                      Image Link
                                    </label>
                                    <input
                                      type="text"
                                      id="imageLink"
                                      name="imageLink"
                                      className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                  </div>



                                  <button
                                    type="submit"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={toggleForm}
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                  >
                                    Cancel
                                  </button>



                                </form>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  )}

                  <div className="h-auto">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Document Name
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              document
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              document type
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              document category
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Edit</span>
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">delete</span>
                            </th>
                          </tr>
                        </thead>
                        {
                          allVirual.map((virual, index) =>

                            <tbody className="bg-white divide-y divide-gray-200" key={virual._id}>
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{virual.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">{virual.link}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm text-gray-500">
                                    {virual.type}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm text-gray-500">
                                    {virual.category}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">

                                  <button onClick={() => handleOpenEditForm(virual)} className="text-indigo-600 hover:text-indigo-900">
                                    Edit
                                  </button>
                                  {/* </Link> */}

                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button onClick={() => handleDelete(virual._id)} className="text-indigo-600 hover:text-indigo-900">
                                    Delete
                                  </button>
                                </td>
                              </tr>  </tbody>
                          )
                        }


                        {isEditVFormVisible && (
                          <div className="fixed z-50 inset-0 overflow-y-auto">
                            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                              <div className="fixed inset-0 transition-opacity">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                              </div>

                              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                  <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                                        Edit Document
                                      </h3>
                                      <form className="mt-4" onSubmit={(e) => e.preventDefault()}>
                                        <div className="mb-4">
                                          <label htmlFor="documentName" className="block text-sm font-medium text-gray-700">
                                            Document Name
                                          </label>
                                          <input
                                            type="text"
                                            id="documentName"
                                            name="title"
                                            onChange={handleInputChange}
                                            value={editVData.title}

                                            className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                          />
                                        </div>
                                        <div className="mb-4">
                                          <label htmlFor="documentURL" className="block text-sm font-medium text-gray-700">
                                            Document URL
                                          </label>
                                          <input
                                            type="text"
                                            id="documentURL"
                                            onChange={handleInputChange}
                                            name="link"
                                            value={editVData.link}

                                            className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                          />
                                        </div>
                                        <div className="mb-4">
                                          <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
                                            Document Type
                                          </label>
                                          <select
                                            id="documentType"
                                            name="type"
                                            value={editVData.type}
                                            onChange={handleInputChange}

                                            className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                          >
                                            {
                                              virualTypes.map((option) => <option key={option} value={option}>{option}</option>)
                                            }
                                          </select>
                                        </div>
                                        <div className="mb-4">
                                          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                            Category
                                          </label>
                                          <select
                                            id="categoryName"
                                            name="category"
                                            onChange={handleInputChange}
                                            value={editVData.category}

                                            className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                          >
                                            {
                                              virualCategories.map((option) => <option key={option} value={option}>{option}</option>)
                                            }
                                          </select>
                                        </div>
                                        <div className="mb-4">
                                          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                                            Content
                                          </label>
                                          <textarea
                                            id="content"
                                            name="content"
                                            onChange={handleInputChange}
                                            value={editVData.content}
                                            rows="4"
                                            className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                          />
                                        </div>
                                        <div className="mb-4">
                                          <label htmlFor="imageLink" className="block text-sm font-medium text-gray-700">
                                            Image Link
                                          </label>
                                          <input
                                            type="text"
                                            id="imageLink"
                                            name="image"
                                            onChange={handleInputChange}
                                            value={editVData.image}
                                            className="mt-1 px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                          />
                                        </div>


                                      </form>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                  <button
                                    onClick={handleSubmitUpdate}
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={toggleEditVForm}
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}


                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>




        </section>
      </div>
    </div>
  );
}

export default Dashboard;
