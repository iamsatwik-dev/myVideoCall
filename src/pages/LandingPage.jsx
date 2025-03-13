import React from 'react';
import { Link, useNavigate } from 'react-router-dom'

function LandingPage() {
    const router = useNavigate();
    return ( <div className='landingPage'>
        <nav>
            <div className='header'>
            <h2>My Video Call</h2>
        
            </div>
            <div className='navlist'>
            <p><b><a href='/aljk23'  style={{color:"whitesmoke"}}>Join as Guest</a></b></p>
            <p ><b><a href='/auth' style={{color:"whitesmoke"}}>Register</a></b></p>
            <div onClick={() => {
                        router("/auth")

                    }}  role='button' style={{cursor:"pointer"}}>
                <b>Login</b>
            </div>
            </div>
        </nav>
        <div className='landing_container'>
            <div className='content'>
                <h1><span style={{color:"#FF9839"}}>Connect</span> with your <br/>Loved Ones</h1>
                <p>Cover a distance by my video call</p>
                <form action="/auth">
                <button>Get Started</button>
                </form>
            </div>
            <div className='image'>
                <img src='\mobile.png'></img>
            </div>
        </div>
        
    </div> );
}

export default LandingPage;