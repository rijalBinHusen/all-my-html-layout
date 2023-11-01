
        class DatePicker {
            date: Date;
            firstDate: number;
            lastDate: number;
            constructor() {
                this.date = new Date()
                this.setFirstAndLastDate();
            }

            setDate(yourDate: number) {
                this.date.setDate(yourDate);
            }

            setMonth(yourMonth: number) {
                this.date.setMonth(yourMonth);
                this.setFirstAndLastDate();
            }

            setYear(yourYear: number) {
                this.date.setFullYear(yourYear);
                this.setFirstAndLastDate();
            }

            getDates() {
                let dates = <number[]>[]
                for (let date = 1; date <= this.lastDate; date++) {

                    dates.push(date)
                }

                return dates;
            }

            getMonths() {
                let month = [
                    {number:0, name: 'January' }, 
                    {number:1, name: 'February'},
                    {number:2, name: 'March'},
                    {number:3, name: 'April'},
                    {number:4, name: 'Mei'},
                    {number:5, name: 'June'},
                    {number:6, name: 'July'},
                    {number:7, name: 'August'},
                    {number:8, name: 'September'},
                    {number:9, name: 'October'},
                    {number:10, name: 'November'},
                    {number:11, name: 'Desember'},
                ]

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

            getCurrentMonth(){
                return this.date.getMonth();
            }

            getCurrentFullYear() {
                return this.date.getFullYear();
            }
        }

        let myDate = new DatePicker();

        class Dom {
            dateElm: HTMLSelectElement;
            monthElm: HTMLSelectElement;
            constructor() {

                this.dateElm = document.getElementById("date") as HTMLSelectElement;
                this.monthElm = document.getElementById("month")  as HTMLSelectElement;
            }

            renderMonth() {
                this.monthElm.innerHTML = "";
                const months = myDate.getMonths();
                const currentMonth = myDate.getCurrentMonth();

                for(let month of months) {
                    let optionElm = document.createElement('option');
                    optionElm.value = month.number + '';
                    optionElm.innerHTML = month.name;

                    if(currentMonth === month.number) {
                        optionElm.setAttribute('selected', 'selected')
                    }

                    this.monthElm.appendChild(optionElm);
                }

                this.monthElm.addEventListener('change', () => {
                    this.changeMonth();
                })
            }

            renderDates() {
                this.dateElm.innerHTML = "";
                const dates = myDate.getDates();
                const currentDate = myDate.getCurrentDate();

                for(let date of dates) {
                    let optionElm = document.createElement('option');
                    optionElm.value = date + '';
                    optionElm.innerHTML = date + '';

                    if(currentDate === date) {
                        optionElm.setAttribute('selected', 'selected')
                    }

                    this.dateElm.appendChild(optionElm);
                }
            }

            changeMonth() {
                const month = document.getElementById("month") as HTMLSelectElement;
                myDate.setMonth(Number(month.value));
                this.renderDates();
                this.showResult();
                console.log(this)
            }

            showResult() {
                const result = document.getElementById("result") as HTMLDivElement;
                result.innerHTML = myDate.date + "";
            }
        }
        
        let theDom = new Dom();

        theDom.renderMonth();
        theDom.renderDates();