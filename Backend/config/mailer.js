import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {user: process.env.emailUser, pass: process.env.appPassword}});


  export default transporter;