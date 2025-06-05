import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import toast, {Toaster} from 'react-hot-toast';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Avatar, Typography, Box, CircularProgress, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, Button, TextField, Chip, Tooltip,
    useTheme, alpha, Divider, FormControl, InputLabel, Select, MenuItem,
    InputAdornment, Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Reciept from "./reciept.jsx";

const StudentList = ({student}) => {
    const theme = useTheme();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editFormData, setEditFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        whatsappNumber: '',
        payment: false,
        amount: '',
        paymentMode: '',
        donation: ''
    });
    const [updateLoading, setUpdateLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const receiptRef = useRef();

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [centerFilter, setCenterFilter] = useState('all');

    // Get unique centers for filter dropdown
    const uniqueCenters = [...new Set(students.map(student => student.center).filter(Boolean))].sort();

    // Calculate amounts by payment mode
    const calculateAmounts = () => {
        const cashAmount = filteredStudents.reduce((sum, student) => {
            return sum + (student.paymentMode === 'Cash' && student.payment === 'Yes' ? (student.amount || 0) : 0);
        }, 0);

        const onlineAmount = filteredStudents.reduce((sum, student) => {
            return sum + (student.paymentMode === 'Online' && student.payment === 'Yes' ? (student.amount || 0) : 0);
        }, 0);

        const totalAmount = filteredStudents.reduce((sum, student) => {
            return sum + (student.payment === 'Yes' ? (student.amount || 0) : 0);
        }, 0);

        // Add donation calculations
        const totalDonation = filteredStudents.reduce((sum, student) => {
            return sum + (student.donation || 0);
        }, 0);

        // Calculate grand total (Amount + Donation)
        const grandTotal = totalAmount + totalDonation;

        return {cashAmount, onlineAmount, totalAmount, totalDonation, grandTotal};
    };

    const {cashAmount, onlineAmount, totalAmount, totalDonation, grandTotal} = calculateAmounts();

    // Change 1: Update the generateReceiptPDF function
    // Change: Update only the generateReceiptPDF function for auto-sizing
    const generateReceiptPDF = async (student) => {
        try {
            // Set the selected student for the receipt
            setSelectedStudent(student);

            // Wait for state update
            await new Promise(resolve => setTimeout(resolve, 100));

            const element = receiptRef.current;
            if (!element) {
                toast.error('Receipt element not found');
                return;
            }

            // Show loading toast
            const loadingToast = toast.loading('Generating PDF...');

            // Configure html2canvas options for better quality
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#3F6F7D',
                width: element.scrollWidth,
                height: element.scrollHeight,
                scrollX: 0,
                scrollY: 0
            });

            const imgData = canvas.toDataURL('image/png', 1.0);

            // Calculate dimensions based on content
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            // Convert pixels to mm (assuming 96 DPI)
            const mmWidth = (canvasWidth * 25.4) / (96 * 2); // divide by 2 because scale is 2
            const mmHeight = (canvasHeight * 25.4) / (96 * 2);

            // Create PDF with dynamic size based on content
            const pdf = new jsPDF({
                orientation: mmWidth > mmHeight ? 'landscape' : 'portrait',
                unit: 'mm',
                format: [mmWidth, mmHeight] // Custom format based on content
            });

            // Add image to PDF with exact content size
            pdf.addImage(imgData, 'PNG', 0, 0, mmWidth, mmHeight);

            // Save with student name
            const fileName = `Receipt_${student.firstName}_${student.lastName}_${student.registerNumber}.pdf`;
            pdf.save(fileName);

            toast.success('PDF downloaded successfully!', {id: loadingToast});
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF');
        }
    };
    const fetchStudents = async () => {
        try {
            const response = await axios.get('https://gurupurnima-be.onrender.com/api/students');
            setStudents(response.data);
            setFilteredStudents(response.data);
        } catch (error) {
            console.error('Error fetching sadhak:', error);
            toast.error('Failed to fetch sadhak');
        } finally {
            setLoading(false);
        }
    };

    // Filter function
    const applyFilters = () => {
        let filtered = students;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(student => {
                const fullName = `${student.firstName} ${student.middleName || ''} ${student.lastName}`.toLowerCase();
                const registerNumber = student.registerNumber?.toString().toLowerCase() || '';
                const whatsappNumber = student.whatsappNumber?.toString().toLowerCase() || '';

                return fullName.includes(searchTerm.toLowerCase()) ||
                    registerNumber.includes(searchTerm.toLowerCase()) ||
                    whatsappNumber.includes(searchTerm.toLowerCase());
            });
        }

        // Apply payment filter
        if (paymentFilter !== 'all') {
            const isPaymentMade = paymentFilter === 'paid';
            filtered = filtered.filter(student => {
                const paymentStatus = student.payment === 'Yes';
                return paymentStatus === isPaymentMade;
            });
        }

        // Apply center filter
        if (centerFilter !== 'all') {
            filtered = filtered.filter(student => student.center === centerFilter);
        }

        setFilteredStudents(filtered);
    };

    // Apply filters whenever search term, payment filter, center filter, or students change
    useEffect(() => {
        applyFilters();
    }, [searchTerm, paymentFilter, centerFilter, students]);

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setPaymentFilter('all');
        setCenterFilter('all');
    };

    const handleEditClick = (student) => {
        setSelectedStudent(student);
        setEditFormData({
            firstName: student.firstName || '',
            middleName: student.middleName || '',
            lastName: student.lastName || '',
            whatsappNumber: student.whatsappNumber || '',
            payment: student.payment === 'Yes',
            amount: student.amount || '',
            paymentMode: student.paymentMode || '',
            donation: student.donation || ''
        });
        setEditModalOpen(true);
    };

    const handleEditClose = () => {
        setEditModalOpen(false);
        setSelectedStudent(null);
        setEditFormData({
            firstName: '',
            middleName: '',
            lastName: '',
            whatsappNumber: '',
            payment: false,
            amount: '',
            paymentMode: '',
            donation: ''
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
        const loadingToast = toast.loading('Updating sadhak...');

        try {
            const response = await axios.put(
                `https://gurupurnima-be.onrender.com/api/students/${selectedStudent._id}`,
                {
                    ...editFormData,
                    payment: editFormData.payment ? 'Yes' : 'No',
                    amount: editFormData.amount ? Number(editFormData.amount) : 0,
                    donation: editFormData.donation ? Number(editFormData.donation) : 0  // Add this line
                }
            );

            // Update the student in the local state
            setStudents(prevStudents =>
                prevStudents.map(student =>
                    student._id === selectedStudent._id
                        ? {
                            ...student, ...editFormData,
                            payment: editFormData.payment ? 'Yes' : 'No',
                            amount: editFormData.amount ? Number(editFormData.amount) : 0,
                            donation: editFormData.donation ? Number(editFormData.donation) : 0  // Add this line
                        }
                        : student
                )
            );

            toast.success('Sadhak updated successfully!', {id: loadingToast});
            handleEditClose();
        } catch (error) {
            console.error('Error updating Sadhak:', error);
            toast.error('Failed to update Sadhak', {id: loadingToast});
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
                            style={{
                                marginRight: 10,
                                border: '0.5px solid #000',
                                padding: 3,
                                borderRadius: '5px',
                                background: '#fff'
                            }}
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
                    Loading sadhak...
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
                            Sadhak Registration Management
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
                        <Box sx={{display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 2}}>
                            <Chip
                                label={`Total Sadhak: ${students.length}`}
                                color="primary"
                                variant="outlined"
                                sx={{fontWeight: 'bold'}}
                            />
                            <Chip
                                label={`Paid: ${filteredStudents.filter(s => s.payment === 'Yes').length}`}
                                color="success"
                                variant="outlined"
                                sx={{fontWeight: 'bold'}}
                            />
                            <Chip
                                label={`Unpaid: ${filteredStudents.filter(s => s.payment === 'No').length}`}
                                color="error"
                                variant="outlined"
                                sx={{fontWeight: 'bold'}}
                            />
                            <Chip
                                label={`Centers: ${[...new Set(filteredStudents.map(s => s.center))].length}`}
                                color="info"
                                variant="outlined"
                                sx={{fontWeight: 'bold'}}
                            />
                        </Box>

                        <Box sx={{display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 2}}>
                            <Chip
                                label={`Cash Amount: ₹${cashAmount.toLocaleString()}`}
                                color="warning"
                                variant="filled"
                                sx={{fontWeight: 'bold', fontSize: '0.9rem'}}
                            />
                            <Chip
                                label={`Online Amount: ₹${onlineAmount.toLocaleString()}`}
                                color="info"
                                variant="filled"
                                sx={{fontWeight: 'bold', fontSize: '0.9rem'}}
                            />
                            <Chip
                                label={`Total Amount: ₹${totalAmount.toLocaleString()}`}
                                color="success"
                                variant="filled"
                                sx={{fontWeight: 'bold', fontSize: '0.9rem'}}
                            />
                            <Chip
                                label={`Total Donation: ₹${totalDonation.toLocaleString()}`}
                                color="secondary"
                                variant="filled"
                                sx={{fontWeight: 'bold', fontSize: '0.9rem'}}
                            />
                            <Chip
                                label={`Grand Total: ₹${grandTotal.toLocaleString()}`}
                                color="error"
                                variant="filled"
                                sx={{fontWeight: 'bold', fontSize: '1.1rem', border: '2px solid #d32f2f'}}
                            />
                        </Box>
                    </Box>

                    {/* Filter Section */}
                    <Paper
                        elevation={0}
                        sx={{
                            mb: 3,
                            p: 3,
                            borderRadius: '16px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                            <FilterListIcon sx={{mr: 1, color: 'primary.main'}}/>
                            <Typography variant="h6" fontWeight="bold">
                                Filters
                            </Typography>
                        </Box>

                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    placeholder="Search by name, register number, or WhatsApp number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="action"/>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ width: '600px' ,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            '&:hover fieldset': {
                                                borderColor: '#1976d2'
                                            }
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Payment Status</InputLabel>
                                    <Select
                                        value={paymentFilter}
                                        onChange={(e) => setPaymentFilter(e.target.value)}
                                        label="Payment Status"
                                        sx={{
                                            borderRadius: '12px',
                                            '& .MuiOutlinedInput-root': {
                                                '&:hover fieldset': {
                                                    borderColor: '#1976d2'
                                                }
                                            }
                                        }}
                                    >
                                        <MenuItem value="all">All Sadhak</MenuItem>
                                        <MenuItem value="paid">Paid Only</MenuItem>
                                        <MenuItem value="unpaid">Unpaid Only</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Center</InputLabel>
                                    <Select
                                        value={centerFilter}
                                        onChange={(e) => setCenterFilter(e.target.value)}
                                        label="Center"
                                        sx={{
                                            borderRadius: '12px',
                                            '& .MuiOutlinedInput-root': {
                                                '&:hover fieldset': {
                                                    borderColor: '#1976d2'
                                                }
                                            }
                                        }}
                                    >
                                        <MenuItem value="all">All Centers</MenuItem>
                                        {uniqueCenters.map((center) => (
                                            <MenuItem key={center} value={center}>
                                                {center}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={2}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={clearFilters}
                                    startIcon={<ClearIcon/>}
                                    sx={{
                                        borderRadius: '12px',
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Clear
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

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
                                        'Number',
                                        'Center',
                                        'Age',
                                        'Payment',
                                        'Payment Mode',
                                        'Donation',
                                        'Guru Diksha',
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
                                {filteredStudents?.map((student, index) => (
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
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 1
                                            }}>
                                                <Box
                                                    sx={{
                                                        display: 'inline-block',
                                                        padding: '6px 12px',
                                                        borderRadius: '8px',
                                                        backgroundColor: student.payment === 'Yes' ? '#e8f5e8' : '#ffeaa7',
                                                        color: student.payment === 'Yes' ? '#2d5016' : '#b7651d',
                                                        fontWeight: 'bold',
                                                        minWidth: '80px',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    {student.payment === 'Yes' ? '✓ Paid' : '✗ Unpaid'}
                                                </Box>
                                                {student.amount && (
                                                    <Typography variant="caption"
                                                                sx={{fontWeight: 'bold', color: '#1976d2'}}>
                                                        ₹{student.amount}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{textAlign: 'center'}}>
                                            {student.paymentMode ? (
                                                <Chip
                                                    label={student.paymentMode}
                                                    color={student.paymentMode === 'Cash' ? 'warning' : 'primary'}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    -
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{textAlign: 'center'}}>
                                            {student.donation ? (
                                                <Chip
                                                    label={`₹${student.donation}`}
                                                    color="secondary"
                                                    size="small"
                                                    variant="filled"
                                                    sx={{fontWeight: 'bold'}}
                                                />
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    -
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{textAlign: 'center'}}>
                                            <Chip
                                                label={student.willTeachersFeeBeTaken === 'Yes' ? 'Yes' : 'No'}
                                                color={student.willTeachersFeeBeTaken === 'Yes' ? 'warning' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell sx={{textAlign: 'center'}}>
                                            <Box sx={{display: 'flex', gap: 1, justifyContent: 'center'}}>
                                                <Tooltip title="Download Receipt PDF" arrow>
                                                    <IconButton
                                                        color="success"
                                                        onClick={() => generateReceiptPDF(student)}
                                                        sx={{
                                                            '&:hover': {
                                                                transform: 'scale(1.1)',
                                                                backgroundColor: alpha(theme.palette.success.main, 0.1),
                                                            },
                                                        }}
                                                    >
                                                        <DownloadIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit Sadhak" arrow>
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

                    {filteredStudents.length === 0 && (
                        <Box sx={{textAlign: 'center', py: 8}}>
                            <Typography variant="h6" color="text.secondary">
                                {searchTerm || paymentFilter !== 'all' || centerFilter !== 'all'
                                    ? 'No sadhak found matching your filters'
                                    : 'No sadhak found'
                                }
                            </Typography>
                            {(searchTerm || paymentFilter !== 'all' || centerFilter !== 'all') && (
                                <Button
                                    onClick={clearFilters}
                                    variant="outlined"
                                    sx={{mt: 2}}
                                    startIcon={<ClearIcon/>}
                                >
                                    Clear Filters
                                </Button>
                            )}
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
                        Edit Sadhak Details
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
                                Sadhak Registration
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
                        <TextField
                            name="whatsappNumber"
                            label="Number"
                            value={editFormData.whatsappNumber}
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
                            name="amount"
                            label="Amount"
                            type="number"
                            value={editFormData.amount}
                            onChange={handleInputChange}
                            fullWidth
                            variant="outlined"
                            InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
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
                            name="donation"
                            label="Donation"
                            type="number"
                            value={editFormData.donation}
                            onChange={handleInputChange}
                            fullWidth
                            variant="outlined"
                            InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
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
                        <FormControl fullWidth>
                            <InputLabel>Payment Mode</InputLabel>
                            <Select
                                name="paymentMode"
                                value={editFormData.paymentMode}
                                onChange={handleInputChange}
                                label="Payment Mode"
                                sx={{
                                    borderRadius: '12px',
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: '#1976d2'
                                        }
                                    }
                                }}
                            >
                                <MenuItem value="Cash">Cash</MenuItem>
                                <MenuItem value="Online">Online</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel id="payment-edit-label">Payment Status</InputLabel>
                            <Select
                                labelId="payment-edit-label"
                                name="payment"
                                value={editFormData.payment ? 'Yes' : 'No'}
                                onChange={(e) =>
                                    setEditFormData((prev) => ({
                                        ...prev,
                                        payment: e.target.value === 'Yes'
                                    }))
                                }
                                label="Payment Status"
                                sx={{
                                    borderRadius: '12px',
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: '#1976d2'
                                        }
                                    }
                                }}
                            >
                                <MenuItem value="Yes">✓ Paid</MenuItem>
                                <MenuItem value="No">✗ Unpaid</MenuItem>
                            </Select>
                        </FormControl>
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
                            'Update Sadhak'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>


            // Change 3: Update the Receipt component reference at the bottom
            <div ref={receiptRef} style={{position: 'absolute', top: '-9999px', left: '-9999px'}}>
                <Reciept student={selectedStudent}/>
            </div>
        </>
    );
};

export default StudentList;