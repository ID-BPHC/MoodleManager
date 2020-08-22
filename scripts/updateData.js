const fs = require("fs");
const config = require("../config");
const readline = require('readline');
const mysql = require('mysql2/promise');
const uploadsDBName = 'TEMP_TEACHER_DATA';
const enrolmentsTableQuery = `CREATE TABLE \`enrolments\`.\`teacher_mapping\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`course\` int(11) NOT NULL,
    \`user\` int(11) NOT NULL,
    \`role\` varchar(32) COLLATE utf8_bin DEFAULT NULL,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;`;


/* createLog Setup */
var log = ``;
function createLog(...strings) {
    for (item of strings) {
        log += item
        log += "\n";
    }
}


async function importFacultyAndScholars() {
    const connection = await mysql.createConnection({
        host: config.mysql_host,
        user: config.mysql_user,
        password: config.mysql_password,
    });
    var fileStream = fs.createReadStream('uploads/faculty.csv');
    var rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    var fcount = 0;
    for await (const line of rl) {
        fcount++;
        const column = line.split(",");
        for (var id in column) {
            column[id] = column[id].trim();
        } 
        var instructorType='faculty'; 
        var [rows, fields] = await connection.execute(`SELECT \`id\` FROM \`${uploadsDBName}\`.\`${instructorType}\` WHERE \`id\` LIKE '${column[0]}' `).catch((err) => {
            createLog(err);
        });
        if(rows.length==0)
        await connection.execute(`INSERT INTO \`${uploadsDBName}\`.\`faculty\` (\`id\`, \`name\`, \`dept\`, \`email\`) VALUES ('${column[0]}', '${column[1]}', 'NULL', '${column[3]}'); `).catch((err) => {
            createLog(err);
        })
    }


    var fileStream = fs.createReadStream('uploads/research.csv');
    var rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    var rcount = 0;
    for await (const line of rl) {
        rcount++;
        const column = line.split(",");
        for (var id in column) {
            column[id] = column[id].trim();
        }
        var instructorType='research'; 
        var [rows, fields] = await connection.execute(`SELECT \`id\` FROM \`${uploadsDBName}\`.\`${instructorType}\` WHERE \`id\` LIKE '${column[0]}' `).catch((err) => {
            createLog(err);
        }); 
        if(rows.length==0)
        await connection.execute(`INSERT INTO \`${uploadsDBName}\`.\`research\` (\`id\`, \`name\`, \`dept\`, \`email\`) VALUES ('${column[0]}', '${column[1]}', 'NULL', '${column[3]}'); `).catch((err) => {
            createLog(err);
        })
    }
    createLog("Faculty", fcount);
    createLog("Research", rcount);

    connection.end();
}


async function processLineByLine() {
    const connection = await mysql.createConnection({
        host: config.mysql_host,
        user: config.mysql_user,
        password: config.mysql_password,
    });
    const fileStream = fs.createReadStream('uploads/timetable.csv');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.
    var count = 0;
    var processed = 0;
    var finalCount = 0;
    for await (const line of rl) {
        createLog("____________________________________________________________\n");
        // Each line in input.txt will be successively available here as `line`.
        var columns = line.split(",");
        var courseName = columns[1] + " " + columns[2] + " " + columns[3] + " " + columns[5];
        courseName = courseName.trim().replace(/\s\s+/g, ' ');
        var instructorType;
        var teacherId = columns[11].trim();
        if (teacherId[0] == 'H') {
            instructorType = 'faculty';
        } else {
            instructorType = 'research';
        }
        if (courseName.length > 4) {
            processed++;
            var [rows, fields] = await connection.execute(`SELECT \`id\` FROM \`moodle\`.\`mdl_course\` WHERE \`fullname\` LIKE '${courseName}' `);
            createLog(courseName);
            createLog("PSRN/ID->", teacherId);
            if (rows.length > 0) {
                var courseId = rows[0].id;
                createLog("The course id is - > ", courseId);
                var [emailRows, emailFields] = await connection.execute(`SELECT \`email\` FROM \`${uploadsDBName}\`.\`${instructorType}\` WHERE \`id\` LIKE '${teacherId}' `);
                if (emailRows.length > 0) {
                    var teacherEmail = emailRows[0].email;
                    createLog("Teacher email : ", teacherEmail);
                    var [moodleRows, moodleFields] = await connection.execute(`SELECT \`id\` FROM \`moodle\`.\`mdl_user\` WHERE \`email\` LIKE '${teacherEmail}'`);
                    if (moodleRows.length > 0) {
                        var userMoodleId = moodleRows[0].id;
                        createLog("For this course, final data : ", courseId, userMoodleId);
                        var insertToEnrolmentsQuery = `INSERT INTO \`enrolments\`.\`teacher_mapping\` (\`id\`, \`course\`, \`user\`, \`role\`) VALUES (NULL, '${courseId}', '${userMoodleId}', NULL);`;
                        await connection.execute(insertToEnrolmentsQuery).catch((err) => createLog("Error while insterting data to teacher_mapping", err));
                        finalCount++;
                    } else {
                        createLog("No row with matching email in mdl_user. Probably user has not logged in at all.");
                        processed--;
                    }
                } else {
                    createLog("No email matched with teacherId", teacherId, " in csv file");
                }

            } else {
                createLog("No matching course in moodle");
            }
        }
        count++;
    }

    createLog("Total", count);
    createLog("Valid", processed);
    createLog("Processed and Inserted into teacher_mapping", finalCount);
    connection.end();

}

async function executeScript() {
    createLog("Importing Faculty and Scholar PSRN/Emails to TEMP DB.")
    await importFacultyAndScholars();
    createLog("Processing the time table and inserting data to enrolments.teacher_mapping")
    await processLineByLine();
    return log;


}
module.exports = {
    executeScript: executeScript
};


// executeScript()
