import React, {useEffect, useState} from 'react';
import axios from 'axios';
import toast, {Toaster} from 'react-hot-toast';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Avatar, Typography, Box, CircularProgress, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, Button, TextField, Chip, Tooltip,
    useTheme, alpha, Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';

const StudentList = () => {
    const theme = useTheme();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editFormData, setEditFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: ''
    });
    const [updateLoading, setUpdateLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchStudents = async () => {
        try {
            const response = await axios.get('https://gurupurnima-be.onrender.com/api/students');
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (student) => {
        setSelectedStudent(student);
        setEditFormData({
            firstName: student.firstName || '',
            middleName: student.middleName || '',
            lastName: student.lastName || ''
        });
        setEditModalOpen(true);
    };

    const handleEditClose = () => {
        setEditModalOpen(false);
        setSelectedStudent(null);
        setEditFormData({
            firstName: '',
            middleName: '',
            lastName: ''
        });
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditSubmit = async () => {
        if (!selectedStudent) return;

        // Validation
        if (!editFormData.firstName.trim()) {
            toast.error('First name is required');
            return;
        }

        setUpdateLoading(true);
        const loadingToast = toast.loading('Updating student...');

        try {
            const response = await axios.put(
                `https://gurupurnima-be.onrender.com/api/students/${selectedStudent._id}`,
                editFormData
            );

            // Update the student in the local state
            setStudents(prevStudents =>
                prevStudents.map(student =>
                    student._id === selectedStudent._id
                        ? {...student, ...editFormData}
                        : student
                )
            );

            toast.success('Student updated successfully!', {id: loadingToast});
            handleEditClose();
        } catch (error) {
            console.error('Error updating student:', error);
            toast.error('Failed to update student', {id: loadingToast});
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleDeleteClick = (student) => {
        toast(
            (t) => (
                <span>
        Are you sure you want to delete <b>{student.firstName} {student.lastName}</b>?
        <div style={{marginTop: 8}}>
          <button
              onClick={async () => {
                  toast.dismiss(t.id);
                  setDeleteLoading(true);
                  const loadingToast = toast.loading('Deleting student...');

                  try {
                      await axios.delete(`https://gurupurnima-be.onrender.com/api/students/${student._id}`);

                      // Remove the student from local state
                      setStudents(prevStudents =>
                          prevStudents.filter(s => s._id !== student._id)
                      );

                      toast.success('Student deleted successfully!', {id: loadingToast});
                  } catch (error) {
                      console.error('Error deleting student:', error);
                      toast.error('Failed to delete student', {id: loadingToast});
                  } finally {
                      setDeleteLoading(false);
                  }
              }}
              style={{marginRight: 10, border: '0.5px solid #000', padding: 3, borderRadius: '5px', background: '#fff'}}
          >
            Yes
          </button>
          <button onClick={() => toast.dismiss(t.id)}
                  style={{
                      marginRight: 10,
                      border: '0.5px solid #000',
                      padding: 3,
                      borderRadius: '5px',
                      background: '#000',
                      color: 'white'
                  }}
          >No</button>
        </div>
      </span>
            ),
            {
                duration: 10000,
            }
        );
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    if (loading) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="400px"
                gap={2}
            >
                <CircularProgress size={60} thickness={4}/>
                <Typography variant="h6" color="text.secondary">
                    Loading students...
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#fff',
                        color: '#333',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        border: '1px solid rgba(255,255,255,0.2)',
                    },
                }}
            />

            <Box sx={{p: 4, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh'}}>
                <Box sx={{maxWidth: '1400px', margin: '0 auto'}}>
                    {/* Header */}
                    <Box sx={{mb: 4, textAlign: 'center'}}>
                        <Typography
                            variant="h3"
                            fontWeight="bold"
                            sx={{
                                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1
                            }}
                        >
                            Sadhak Regetraion Management
                        </Typography>
                            <Typography
                                variant="h3"
                                fontWeight="bold"
                                sx={{
                                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1
                                }}
                            >
                            JBS Technology
                        </Typography>
                        <Chip
                            label={`Total Students: ${students.length}`}
                            color="primary"
                            variant="outlined"
                            sx={{mt: 2, fontWeight: 'bold'}}
                        />
                    </Box>

                    {/* Table */}
                    <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                            borderRadius: '16px',
                            overflow: 'hidden',
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {[
                                        'Register No.',
                                        'Photo',
                                        'Name',
                                        'WhatsApp',
                                        'Center',
                                        'Age',
                                        'Teacher\'s Fee Taken',
                                        'Will Fee Be Taken',
                                        'Actions'
                                    ].map((header) => (
                                        <TableCell
                                            key={header}
                                            sx={{
                                                background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '0.95rem',
                                                textAlign: 'center',
                                                borderBottom: 'none',
                                                py: 2
                                            }}
                                        >
                                            {header}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {students?.map((student, index) => (
                                    <TableRow
                                        key={student._id}
                                        sx={{
                                            '&:nth-of-type(odd)': {
                                                backgroundColor: alpha(theme.palette.primary.main, 0.02)
                                            },
                                            '&:hover': {
                                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                                transform: 'scale(1.001)',
                                                transition: 'all 0.2s ease-in-out'
                                            },
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <TableCell sx={{textAlign: 'center', fontWeight: 'medium'}}>
                                            {student.registerNumber}
                                        </TableCell>
                                        <TableCell sx={{textAlign: 'center'}}>
                                            <Avatar
                                                src={student?.photo || ''}
                                                alt={student.firstName}
                                                sx={{
                                                    width: 64,
                                                    height: 64,
                                                    margin: '0 auto',
                                                    border: '3px solid #1976d2',
                                                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                                                }}
                                            >
                                                <PersonIcon/>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell sx={{textAlign: 'center'}}>
                                            <Typography variant="body1" fontWeight="medium">
                                                {`${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{textAlign: 'center'}}>
                                            <Chip
                                                label={student.whatsappNumber}
                                                variant="outlined"
                                                color="success"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell sx={{textAlign: 'center'}}>
                                            <Chip
                                                label={student.center}
                                                color="info"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell sx={{textAlign: 'center', fontWeight: 'medium'}}>
                                            {student.age}
                                        </TableCell>
                                        <TableCell sx={{textAlign: 'center'}}>
                                            <Chip
                                                label={student.teachersFeeTaken ? 'Yes' : 'No'}
                                                color={student.teachersFeeTaken ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell sx={{textAlign: 'center'}}>
                                            <Chip
                                                label={student.willTeachersFeeBeTaken ? 'Yes' : 'No'}
                                                color={student.willTeachersFeeBeTaken ? 'warning' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell sx={{textAlign: 'center'}}>
                                            <Box sx={{display: 'flex', gap: 1, justifyContent: 'center'}}>
                                                <Tooltip title="Edit Student" arrow>
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleEditClick(student)}
                                                        disabled={updateLoading}
                                                        sx={{
                                                            '&:hover': {
                                                                transform: 'scale(1.1)',
                                                                backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                                            }
                                                        }}
                                                    >
                                                        <EditIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Student" arrow>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleDeleteClick(student)}
                                                        disabled={deleteLoading}
                                                        sx={{
                                                            '&:hover': {
                                                                transform: 'scale(1.1)',
                                                                backgroundColor: alpha(theme.palette.error.main, 0.1)
                                                            }
                                                        }}
                                                    >
                                                        <DeleteIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {students.length === 0 && (
                        <Box sx={{textAlign: 'center', py: 8}}>
                            <Typography variant="h6" color="text.secondary">
                                No students found
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Enhanced Edit Modal */}
            <Dialog
                open={editModalOpen}
                onClose={handleEditClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                        overflow: 'visible'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                        color: 'white',
                        textAlign: 'center',
                        position: 'relative',
                        py: 3
                    }}
                >
                    <Typography variant="h5" fontWeight="bold">
                        Edit Student Details
                    </Typography>
                    <IconButton
                        onClick={handleEditClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'white',
                            '&:hover': {backgroundColor: 'rgba(255,255,255,0.1)'}
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{p: 4}}>
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 3, gap: 2}}>
                        <Avatar
                            src={selectedStudent?.photo || ''}
                            alt={selectedStudent?.firstName}
                            sx={{
                                width: 60,
                                height: 60,
                                border: '3px solid #1976d2'
                            }}
                        >
                            <PersonIcon/>
                        </Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight="bold">
                                {selectedStudent?.registerNumber}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Student Registration
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{mb: 3}}/>

                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                        <TextField
                            name="firstName"
                            label="First Name"
                            value={editFormData.firstName}
                            onChange={handleInputChange}
                            fullWidth
                            variant="outlined"
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    '&:hover': {
                                        '& > fieldset': {
                                            borderColor: '#1976d2'
                                        }
                                    }
                                }
                            }}
                        />
                        <TextField
                            name="middleName"
                            label="Middle Name"
                            value={editFormData.middleName}
                            onChange={handleInputChange}
                            fullWidth
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    '&:hover': {
                                        '& > fieldset': {
                                            borderColor: '#1976d2'
                                        }
                                    }
                                }
                            }}
                        />
                        <TextField
                            name="lastName"
                            label="Last Name"
                            value={editFormData.lastName}
                            onChange={handleInputChange}
                            fullWidth
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    '&:hover': {
                                        '& > fieldset': {
                                            borderColor: '#1976d2'
                                        }
                                    }
                                }
                            }}
                        />
                    </Box>
                </DialogContent>

                <DialogActions sx={{p: 3, gap: 2}}>
                    <Button
                        onClick={handleEditClose}
                        variant="outlined"
                        sx={{
                            borderRadius: '12px',
                            px: 3,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEditSubmit}
                        variant="contained"
                        disabled={updateLoading}
                        sx={{
                            borderRadius: '12px',
                            px: 3,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1565c0, #1976d2)'
                            }
                        }}
                    >
                        {updateLoading ? (
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <CircularProgress size={20} color="inherit"/>
                                Updating...
                            </Box>
                        ) : (
                            'Update Student'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default StudentList;