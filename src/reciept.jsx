import React from 'react'
import {Box, Container, Grid, Typography} from "@mui/material";
import moon from "./assets/images/Group 978.png";
import text from "./assets/images/Group 979 (1).png";
import img from "./assets/images/image 21.png";
import shedow from "./assets/images/Ellipse 26.png";
import blackshedow from "./assets/images/Rectangle 72.png";

const Reciept = ({ student }) => {
    return (
        <Container sx={{bgcolor: '#3F6F7D'}}>
            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <Box sx={{position: 'relative', display: 'inline-block'}}>
                    {/* Overlay shadow image behind */}
                    <Box sx={{position: 'absolute', top: 0, left: 0, zIndex: 0}}>
                        <img src={shedow} alt="overlay"/>
                    </Box>
                    <Box sx={{position: 'absolute', bottom: 0, left: 0, zIndex: 100}}>
                        <img src={blackshedow} alt="overlay"/>
                    </Box>

                    {/* Main image on top */}
                    <Box sx={{position: 'relative', zIndex: 1}}>
                        <img src={img} alt="main"/>
                    </Box>
                </Box>


                <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column"
                }}>
                    <Typography sx={{fontSize: '32px', color: '#fff', fontWeight: 600, textWrap: 'nowrap'}}>
                        || જય બાબા સ્વામી ||
                    </Typography>
                    <Typography sx={{fontSize: '25px', color: '#fff', fontWeight: 600, my: 2}}>
                        સમર્પણ પરિવાર વરાછા ઝોન, સુરત.
                    </Typography>
                    <Box>
                        <img src={text}/>
                    </Box>
                </Box>
                <Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: "column"
                }}>
                    <Box>
                        <img src={moon}/>
                    </Box>
                    <Box sx={{width: '335px'}}>
                        <Typography sx={{fontSize: '20px', color: '#fff', fontWeight: 600}}>
                            સમય: સવારે 5 : 00
                        </Typography>
                        <Typography sx={{fontSize: '20px', color: '#fff', fontWeight: 600}}>
                            સમય: S.M.C કોમ્યુનિટી હોલ, સુદામા ચોક થી ફાયર સ્ટેશન રોડ, વર્ણી પ્લાઝા ની સામે મોટા
                            વરાછા, સુરત.
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100px',
                    textAlign: 'center',
                }}
            >
                <Typography
                    sx={{
                        fontSize: '50px',
                        color: '#fff',
                        fontFamily: '"Dancing Script", cursive',
                        fontWeight: 500,
                    }}
                >
                    Thank you for your donation. We value your support.
                </Typography>
            </Box>

            <Grid container spacing={2} p={6}>
                <Grid size={6}>
                    <Box sx={{display: 'flex'}}>
                        <Typography sx={{color: '#fff', fontSize: '34px'}}>Recipt No :</Typography>
                        <Typography sx={{
                            color: '#fff',
                            fontSize: '34px',
                            ml: 4,
                            borderBottom: '2px solid #fff', width:'58%'
                        }}>{student?.registerNumber || 'N/A'}</Typography>
                    </Box>
                </Grid>
                <Grid size={6}>
                    <Box sx={{display: 'flex'}}>
                        <Typography sx={{color: '#fff', fontSize: '34px'}}>Date :</Typography>
                        <Typography sx={{
                            color: '#fff',
                            fontSize: '34px',
                            ml: 4,
                            borderBottom: '2px solid #fff', width:'70%'
                        }}>{new Date().toLocaleDateString('en-IN')}</Typography>
                    </Box>
                </Grid>
                <Grid size={12}>
                    <Box sx={{display: 'flex', mt:'22px'}}>
                        <Typography sx={{color: '#fff', fontSize: '34px'}}>Name :</Typography>
                        <Typography sx={{
                            color: '#fff',
                            fontSize: '34px',
                            ml: 4,
                            borderBottom: '2px solid #fff', width:'84%'
                        }}>{student ? `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim() : 'N/A'}</Typography>
                    </Box>
                </Grid>
                <Grid size={12}>
                    <Box sx={{display: 'flex', mt:'22px'}}>
                        <Typography sx={{color: '#fff', fontSize: '34px'}}>Center :</Typography>
                        <Typography sx={{
                            color: '#fff',
                            fontSize: '34px',
                            ml: 4,
                            borderBottom: '2px solid #fff', width:'84%'
                        }}>{student?.center || 'N/A'}</Typography>
                    </Box>
                </Grid>
                <Grid size={12}>
                    <Box sx={{display: 'flex', mt:'22px'}}>
                        <Typography sx={{color: '#fff', fontSize: '34px'}}>Phone No :</Typography>
                        <Typography sx={{
                            color: '#fff',
                            fontSize: '34px',
                            ml: 4,
                            borderBottom: '2px solid #fff', width:'80%'
                        }}>{student?.whatsappNumber || 'N/A'}</Typography>
                    </Box>
                </Grid>
                <Grid size={12}>
                    <Box sx={{display: 'flex', mt:'22px'}}>
                        <Typography sx={{color: '#fff', fontSize: '34px'}}>Amount :</Typography>
                        <Typography sx={{
                            color: '#fff',
                            fontSize: '34px',
                            ml: 4,
                            borderBottom: '2px solid #fff', width:'83%'
                        }}> ₹{student?.amount || '0'}</Typography>
                    </Box>
                </Grid>
                <Grid size={12}>
                    <Box sx={{display: 'flex', mt:'22px'}}>
                        <Typography sx={{color: '#fff', fontSize: '34px'}}>Payment Methode :</Typography>
                        <Typography sx={{
                            color: '#fff',
                            fontSize: '34px',
                            ml: 4,
                            borderBottom: '2px solid #fff', width:'68%'
                        }}>{student?.paymentMode || '-'}</Typography>
                    </Box>
                </Grid>
            </Grid>

        </Container>
    )
}
export default Reciept
