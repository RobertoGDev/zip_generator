//Iniciamos dependencias
const fs = require('fs');
const inquirer = require('inquirer');
const archiver = require('archiver');

//Question si quiere hacer el zip, para continuar o no
let wantToZip = [
    {
        message: '¿Desea crear un archivo zip?',
        type: 'confirm',
        default: false,
        name: 'setZip'
    }
];

//Creamos las questions del prompt
let questions = [
    {
        message: 'Seleccione los archivos a incluir',
        type: 'checkbox',
        name: 'filesToInclude',
        choices: [{
                name: "prueba1.txt",
            },
            {
                name: "prueba2.txt"
            },
            {
                name: "prueba3.txt"
            }
        ]
    },
    {
        message: 'Asigne un nombre al archivo zip de salida',
        type: 'input',
        name: 'outputfile',
    }
];

//answers.setZip
//answers.outputFile
//answers.fileToInclude

inquirer.prompt(wantToZip).then(continueExecution => {

    if (continueExecution.setZip) {
        
        inquirer.prompt(questions).then(answers => {

            let dir = './zip_folder';

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }

            let output = fs.createWriteStream(dir + '/' + answers.outputfile + '.zip');
            let archive = archiver('zip', {
                zlib: {
                    level: 9
                } // Sets the compression level.
            });

            output.on('close', function () {
                console.log(archive.pointer() + ' total bytes');
                console.log('el archivador se ha finalizado y el descriptor del archivo de salida se ha cerrado.');
            });

            output.on('end', function () {
                console.log('Archivos compilados en zip');
            });

            // good practice to catch warnings (ie stat failures and other non-blocking errors)
            archive.on('warning', function (err) {
                if (err.code === 'ENOENT') {
                    // log warning
                } else {
                    // throw error
                    throw err;
                }
            });

            // good practice to catch this error explicitly
            archive.on('error', function (err) {
                throw err;
            });

            archive.pipe(output);

            answers.filesToInclude.forEach(file => {
                archive.append(fs.createReadStream('./files_to_zip/' + file), {
                    name: file
                });
            });

            archive.finalize();

        }).catch((error) => {
            console.log('Ha ocurrido un error: '+error);
        });       
    } else {
        console.log('Saliendo del sistema...');
    }
});
