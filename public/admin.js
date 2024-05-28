document.addEventListener('DOMContentLoaded', function() {
    const db = firebase.firestore();

    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth() + 1; 

    document.getElementById('loginButton').addEventListener('click', function() {
        const mailEntered = document.getElementById('emailInput').value;
        const passwordEntered = document.getElementById('passwordInput').value;
        firebase.auth().signInWithEmailAndPassword(mailEntered, passwordEntered)
            .then((credential) => {
                document.getElementById('loginSection').style.display = 'none';
                document.getElementById('prayerTimesForm').style.display = 'block';
                generateInputTable(currentYear, currentMonth);
            })
            .catch((error) => {
                document.getElementById('loginError').innerText = 'Incorrect password, please try again.';
            })
    });

    function generateInputTable(year, month) {
        let daysInMonth = new Date(year, month, 0).getDate();
        let table = document.getElementById('inputTable');
        table.innerHTML = `
        <tr>
            <th colspan="6">
                <button id="prevMonthButton">Previous Month</button>
                ${month}-${year}
                <button id="nextMonthButton">Next Month</button>
            </th>
        </tr>
        <tr>
            <th>Day</th>
            <th>Imsak</th>
            <th>Dhuhr</th>
            <th>Asr</th>
            <th>Maghrib</th>
            <th>Isha</th>
        </tr>`;
        for (let day = 1; day <= daysInMonth; day++) {
            let row = table.insertRow();
            row.insertCell(0).innerText = day;
            ['Imsak', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach(prayer => {
                let cell = row.insertCell();
                let input = document.createElement('input');
                input.type = 'time';
                input.name = `${prayer}-${day}`;
                cell.appendChild(input);
            });
        }

        document.getElementById('prevMonthButton').addEventListener('click', function() {
            if (currentMonth === 1) {
                currentMonth = 12;
                currentYear--;
            } else {
                currentMonth--;
            }
            generateInputTable(currentYear, currentMonth);
        });
        document.getElementById('nextMonthButton').addEventListener('click', function() {
            if (currentMonth === 12) {
                currentMonth = 1;
                currentYear++;
            } else {
                currentMonth++;
            }
            generateInputTable(currentYear, currentMonth);
        });
    }

    document.getElementById('submitPrayerTimesButton').addEventListener('click', function() {
        let monthYear = `${currentMonth}-${currentYear}`;
        let formData = {};
        new FormData(document.getElementById('prayerTimesForm')).forEach((value, key) => {
            let [prayer, day] = key.split('-');
            if (!formData[day]) formData[day] = {};
            formData[day][prayer] = value;
        });
        db.collection('prayerTimes').doc(monthYear).set(formData)
            .then(() => alert('Prayer times saved successfully!'))
            .catch(error => alert('Error saving data: ' + error.message));
    });
});