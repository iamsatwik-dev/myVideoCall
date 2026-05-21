import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';

import { IconButton } from '@mui/material';
export default function History() {


    const { getHistoryOfUser } = useContext(AuthContext);

    const [meetings, setMeetings] = useState([])


    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch {
                // IMPLEMENT SNACKBAR
            }
        }

        fetchHistory();
    }, [])

    let formatDate = (dateString) => {

        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear();

        return `${day}/${month}/${year}`

    }

    return (
        <div className="historyContainer">
            <div className="historyHeader">
                <IconButton onClick={() => {
                    routeTo("/home")
                }} style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", padding: "10px" }}>
                    <HomeIcon sx={{ color: "white" }} />
                </IconButton>
                <h2>Meeting History</h2>
            </div>
            
            {meetings.length !== 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {meetings.map((e, i) => (
                        <Card className="historyCard" key={i} variant="outlined">
                            <CardContent style={{ padding: "24px" }}>
                                <Typography sx={{ fontSize: "1.1rem", fontWeight: "600", color: "#60a5fa", mb: 1 }} gutterBottom>
                                    Meeting Code: {e.meetingCode}
                                </Typography>
                                <Typography sx={{ fontSize: "0.95rem", color: "rgba(255, 255, 255, 0.5)" }}>
                                    Joined on: {formatDate(e.date)}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255, 255, 255, 0.4)" }}>
                    <p style={{ fontSize: "1.2rem" }}>No meeting history found.</p>
                </div>
            )}
        </div>
    )
}