class DatePicker {
    constructor(yearLimit) {
        this.date = new Date();
        this.setFirstAndLastDate();
        this.yearLimit = yearLimit;
    }
    setDate(yourDate) {
        this.date.setDate(yourDate);
    }
    setMonth(yourMonth) {
        this.date.setMonth(yourMonth);
        this.setFirstAndLastDate();
    }
    setYear(yourYear) {
        this.date.setFullYear(yourYear);
        this.setFirstAndLastDate();
    }
    getDates() {
        let dates = [];
        for (let date = 1; date <= this.lastDate; date++) {
            dates.push(date);
        }
        return dates;
    }
    getMonths() {
        let month = [
            { number: 0, name: 'January' },
            { number: 1, name: 'February' },
            { number: 2, name: 'March' },
            { number: 3, name: 'April' },
            { number: 4, name: 'Mei' },
            { number: 5, name: 'June' },
            { number: 6, name: 'July' },
            { number: 7, name: 'August' },
            { number: 8, name: 'September' },
            { number: 9, name: 'October' },
            { number: 10, name: 'November' },
            { number: 11, name: 'Desember' },
        ];
        return month;
    }
    setFirstAndLastDate() {
        let lastDay = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0);
        this.firstDate = 1;
        this.lastDate = lastDay.getDate();
    }
    getCurrentDate() {
        return this.date.getDate();
    }
    getCurrentMonth() {
        return this.date.getMonth();
    }
    getCurrentFullYear() {
        return this.date.getFullYear();
    }
    getYears() {
        let result = [];
        let fullYearLimit = this.getCurrentFullYear() + this.yearLimit;
        let lastYear = this.getCurrentFullYear() > fullYearLimit
            ? this.getCurrentFullYear()
            : fullYearLimit;
        let firstYear = this.getCurrentFullYear() < fullYearLimit
            ? this.getCurrentFullYear()
            : fullYearLimit;
        for (let year = firstYear; year <= lastYear; year++) {
            result.push(year);
        }
        return result;
    }
}
let myDate = new DatePicker(14);
class Dom {
    constructor() {
        this.dateElm = document.getElementById("date");
        this.monthElm = document.getElementById("month");
        this.yearElm = document.getElementById("year");
        this.dateElm.addEventListener('change', () => {
            this.changeDate();
        });
        this.monthElm.addEventListener('change', () => {
            this.changeMonth();
        });
        this.yearElm.addEventListener('change', () => {
            this.changeYear();
        });
    }
    renderMonth() {
        this.monthElm.innerHTML = "";
        const months = myDate.getMonths();
        const currentMonth = myDate.getCurrentMonth();
        for (let month of months) {
            let optionElm = document.createElement('option');
            optionElm.value = month.number + '';
            optionElm.innerHTML = month.name;
            if (currentMonth === month.number) {
                optionElm.setAttribute('selected', 'selected');
            }
            this.monthElm.appendChild(optionElm);
        }
    }
    renderYears() {
        this.yearElm.innerHTML = "";
        const years = myDate.getYears();
        const currentYear = myDate.getCurrentFullYear();
        for (let year of years) {
            let optionElm = document.createElement('option');
            optionElm.value = year + '';
            optionElm.innerHTML = year + '';
            if (currentYear === year) {
                optionElm.setAttribute('selected', 'selected');
            }
            this.yearElm.appendChild(optionElm);
        }
    }
    renderDates() {
        this.dateElm.innerHTML = "";
        const dates = myDate.getDates();
        const currentDate = myDate.getCurrentDate();
        for (let date of dates) {
            let optionElm = document.createElement('option');
            optionElm.value = date + '';
            optionElm.innerHTML = date + '';
            if (currentDate === date) {
                optionElm.setAttribute('selected', 'selected');
            }
            this.dateElm.appendChild(optionElm);
        }
    }
    changeMonth() {
        const month = document.getElementById("month");
        myDate.setMonth(Number(month.value));
        this.renderDates();
        this.showResult();
    }
    changeYear() {
        const month = document.getElementById("year");
        myDate.setYear(Number(month.value));
        this.renderDates();
        this.renderMonth();
        this.showResult();
    }
    changeDate() {
        const month = document.getElementById("date");
        myDate.setDate(Number(month.value));
        this.showResult();
    }
    showResult() {
        const result = document.getElementById("result");
        result.innerHTML = myDate.date.toLocaleString("id-ID");
    }
}
let theDom = new Dom();
theDom.renderMonth();
theDom.renderDates();
theDom.renderYears();
