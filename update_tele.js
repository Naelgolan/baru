const fs = require('fs');
const path = require('path');

const filePath = path.join('fe-mindease-main', 'fe-mindease-main', 'src', 'pages', 'Telekonsultasi.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// replace doctors array with useEffect
const oldImport = "import { useState } from 'react';";
const newImport = "import { useState, useEffect } from 'react';";
content = content.replace(oldImport, newImport);

const oldDoctors = `  const doctors = [
    { id:1, name:'Dr. Budi Santoso, M.Psi', spec:'Konselor Akademik Kampus',    exp:'8 Tahun', rating:4.9, reviews:214, available:true,  tags:['Kecemasan Skripsi','Burnout','Manajemen Waktu'] },
    { id:2, name:'Rina Oktavia, M.Psi',     spec:'Psikolog Dewasa Muda',        exp:'5 Tahun', rating:4.8, reviews:156, available:true,  tags:['Quarter Life Crisis','Homesick','Depresi']    },
    { id:3, name:'Dr. Sarah Wijaya, Sp.KJ', spec:'Psikiater Mahasiswa',         exp:'10 Tahun',rating:5.0, reviews:312, available:false, tags:['ADHD','Gangguan Tidur','Stres Ujian']         },
  ];`;

const newDoctors = `  const [doctors, setDoctors] = useState([]);
  useEffect(() => {
    fetch('http://localhost:5000/api/public/doctors')
      .then(res => res.json())
      .then(data => setDoctors(data))
      .catch(e => console.error(e));
  }, []);`;

content = content.replace(oldDoctors, newDoctors);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done');
