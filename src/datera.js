(() => {
  const Datera = function (
    input,
    options = {
      value: undefined,
      divider: undefined,
      minYear: undefined,
      maxYear: undefined,
      disabledDates: undefined,
      enabledDates: undefined,
      startWeek: undefined,
      daysOfWeek: undefined,
      selectionType: undefined,
      theme: undefined,
    }
  ) {
    if (options.value) {
      this.value = options.value.map((val) => new Date(val));
    }
    if (options.minYear) {
      this.minYear = options.minYear;
    }
    if (options.maxYear) {
      this.maxYear = options.maxYear;
    }
    if (options.disabledDates) {
      this.disabledDates = options.disabledDates?.map((val) => new Date(val));
    }
    if (options.enabledDates) {
      this.enabledDates = options.enabledDates?.map((val) => new Date(val));
    }
    if (options.startWeek) {
      this.startWeek = options.startWeek;
    }
    if (options.daysOfWeek) {
      this.daysOfWeek = options.daysOfWeek;
    }
    if (options.selectionType) {
      this.selectionType = options.selectionType;
    }
    if (options.theme) {
      this.theme = options.theme;
    }
    if (options.divider) {
      this.divider = options.divider;
    }

    this.input =
      typeof input == "string"
        ? document.querySelector(input) ||
          document.querySelector("." + input) ||
          document.querySelector("#" + input)
        : input;

    if (this.input) {
      this.input.readOnly = true;
    }
  };

  Datera.prototype = {
    // The target input
    input: null,

    // The values
    value: [],

    // when joining more dates
    divider: " - ",

    // Type of selection (single, list, range)
    selectionType: "single",

    // Highlighted day (today)
    currentDay: new Date().getDate(),

    // Gets the current date (default today)
    currentDate: new Date(),

    // Minimum year that can be selected
    minYear: null,

    // Maximum year that can be selected
    maxYear: null,

    // Minimum date that can be selected
    minDate: null,

    // Maximum date that can be selected
    maxDate: null,

    // List of disabled dates (null = ignored)
    disabledDates: null,

    // List of enabled dates (null = ignored)
    enabledDates: null,

    // First day of the week (0 - sunday; 1 - monday)
    startWeek: 0,

    // List of strings for the weeks
    daysOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

    // The theme
    theme: "theme1-dark",

    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],

    // Internally used variables
    calendarDays: [],
    calendarDOM: null,
    position: [],

    mount() {
      this.bindEvents();
      this.getCalendarDays();
    },

    // Binds the events
    getGridDays() {
      const startCurrentDay = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        1
      );
      const startPrevMonth = new Date(startCurrentDay);
      startPrevMonth.setDate(
        startPrevMonth - getDate() - startPrevMonth.getDay()
      );
    },
    placeCalendar() {
      if (this.calendarDOM) {
        const calendarBoundingRect = this.calendarDOM?.getBoundingClientRect();
        if (
          this.position[1] + calendarBoundingRect.height + this.position[3] >=
          window.innerHeight + window.scrollY
        ) {
          this.calendarDOM.style.setProperty(
            "--position-y",
            this.position[1] - calendarBoundingRect.height + "px"
          );
        } else {
          this.calendarDOM.style.setProperty("--position-x", this.position[0]);
          this.calendarDOM.style.setProperty(
            "--position-y",
            this.position[1] + this.position[3] + "px"
          );
        }
      }
    },
    bindEvents() {
      this.input.addEventListener("click", () => this.showCalendar());
      this.input.addEventListener("focus", () => this.showCalendar());
      window.addEventListener("scroll", () => {
        this.calculatePosition();
        this.placeCalendar();
      });
      window.addEventListener("resize", () => {
        this.calculatePosition();
        this.placeCalendar();
      });
    },

    // Hides the calendar
    hideCalendar(event) {
      if (
        !this.calendarDOM.contains(event.target) &&
        this.input != event.target
      ) {
        if (!this.calendarDOM.classList.contains("hidden")) {
          this.calendarDOM.classList.add("hidden");
        }
      }
    },

    formatDisplayDate(date) {
      return `${("0" + date.getMonth()).slice(-2)}-${(
        "0" + date.getDate()
      ).slice(-2)}-${date.getFullYear()}`;
    },
    displayValue() {
      if (this.selectionType == "single" && this.value[0]) {
        this.input.value = this.formatDisplayDate(this.value[0]);
      } else if (
        this.selectionType == "range" &&
        this.value[0] &&
        this.value[1]
      ) {
        this.input.value = this.value
          .map(this.formatDisplayDate)
          .join(this.divider);
      } else if (this.selectionType == "list" && this.value.length) {
        this.input.value = this.value
          .map(this.formatDisplayDate)
          .join(this.divider);
      }
    },

    // Calculate the position of the calendar
    calculatePosition() {
      const inputRect = this.input.getBoundingClientRect();

      this.position[0] = inputRect.left + window.screenX;
      this.position[1] = inputRect.top + window.scrollY;
      this.position[2] = inputRect.width;
      this.position[3] = inputRect.height;
    },
    getSelectedValue() {
      const selectedDate = new Date(this.value[0]);

      return selectedDate;
    },
    getAvailableYears() {
      if (!this.minYear) {
        this.minYear = new Date().getFullYear() - 100;
      }
      if (!this.maxYear) {
        this.maxYear = new Date().getFullYear() + 101;
      }

      return new Array(this.maxYear - this.minYear + 1)
        .fill(null)
        .map((y, i) => this.minYear + i);
    },
    getCalendarDays() {
      this.calendarDays = [];

      const selectedMonth = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        1
      );
      const fromStartOfMonth = new Date(this.currentDate);
      fromStartOfMonth.setDate(1 + this.startWeek - selectedMonth.getDay());
      if (
        fromStartOfMonth.getMonth() == selectedMonth.getMonth() &&
        fromStartOfMonth.getDate() != 1
      ) {
        fromStartOfMonth.setDate(fromStartOfMonth.getDate() - 7);
      }
      const fromEndOfMonth = new Date(this.currentDate);
      fromEndOfMonth.setMonth(fromEndOfMonth.getMonth() + 1);
      fromEndOfMonth.setDate(1);
      if (fromEndOfMonth.getDay() - this.startWeek == 0) {
        fromEndOfMonth.setDate(fromEndOfMonth.getDate() - 1);
      } else {
        fromEndOfMonth.setDate(
          fromEndOfMonth.getDate() +
            (6 - fromEndOfMonth.getDay() + this.startWeek)
        );
      }
      return this.generateCalendarDays(fromStartOfMonth, fromEndOfMonth);
    },
    generateCalendarDays(from, to) {
      let days = [];
      let currentDay = new Date(from);
      while (currentDay <= to || days.length / 7 != 6) {
        days.push(new Date(currentDay));
        currentDay.setDate(currentDay.getDate() + 1);
      }
      return days;
    },
    generateCalendarWeeks(from, to) {
      let days = this.generateCalendarDays(from, to);

      let groupedWeeks = [];
      for (let i = 0; i < days.length / 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (!groupedWeeks[i]) {
            groupedWeeks[i] = [];
          }
          groupedWeeks[i][j] = days[i * 7 + j];
        }
      }
      return groupedWeeks;
    },
    changeMonth(step) {
      if (step == 1) {
        if (this.currentDate.getMonth() == 11) {
          this.currentDate.setFullYear(this.currentDate.getFullYear() + 1);
          this.currentDate.setMonth(0);
        } else {
          this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        }
      } else if (step == -1) {
        if (this.currentDate.getMonth() == 0) {
          this.currentDate.setFullYear(this.currentDate.getFullYear() - 1);
          this.currentDate.setMonth(11);
        } else {
          this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        }
      }
    },
    canNavigateBack() {
      if (
        this.minYear == this.currentDate.getFullYear() &&
        this.currentDate.getMonth() == 0
      ) {
        return false;
      }

      if (
        this.minDate?.getFullYear() == this.currentDate.getFullYear() &&
        this.minDate?.getMonth() == this.currentDate.getMonth()
      ) {
        return false;
      }

      return true;
    },
    canNavigateNext() {
      console.log(
        this.maxYear,
        this.currentDate.getFullYear(),
        this.currentDate.getMonth()
      );
      if (
        this.maxYear == this.currentDate.getFullYear() &&
        this.currentDate.getMonth() == 11
      ) {
        return false;
      }

      if (
        this.maxDate?.getFullYear() == this.currentDate.getFullYear() &&
        this.maxDate?.getMonth() == this.currentDate.getMonth()
      ) {
        return false;
      }

      return true;
    },
    showCalendar() {
      this.calculatePosition();
      if (!this.calendarDOM) {
        this.calendarDOM = document.createElement("div");
      }

      console.log(this.canNavigateBack(), this.canNavigateNext());

      this.calendarDOM.classList = `datera--calendar ${this.theme}`;
      this.calendarDOM.innerHTML = `
      <div class="datera--controls">
        <button class="datera--month-decrement" ${
          this.canNavigateBack() ? "" : "disabled"
        }><svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-left"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 6l-6 6l6 6" /></svg></button>
        <div class="datera--control-selects">
        <select class="datera--month-select">
          ${this.months.map(
            (month, i) =>
              `<option ${
                this.currentDate.getMonth() == i ? "selected" : ""
              } value="${i}">${month}</option>`
          )}
        </select>
        <select class="datera--year-select">
          ${this.getAvailableYears().map(
            (year, i) =>
              `<option ${
                this.currentDate.getFullYear() == year ? "selected" : ""
              } value="${year}">${year}</option>`
          )}
        </select>
        </div>
        <button class="datera--month-increment" ${
          this.canNavigateNext() ? "" : "disabled"
        }><svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-right"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 6l6 6l-6 6" /></svg></button>
      </div>
            <div class="datera--grid">
            ${new Array(7)
              .fill("")
              .map(
                (_, i) =>
                  `<p class="datera--day-of-week">${this.daysOfWeek[i]}</p>`
              )
              .join("")}
            </div>
            <div class="datera--grid days">
            </div>`;

      this.calendarDOM
        .querySelector(".datera--year-select")
        .addEventListener("change", () => {
          this.currentDate.setFullYear(
            this.calendarDOM.querySelector(".datera--year-select").value
          );
          this.showCalendar();
        });
      this.calendarDOM
        .querySelector(".datera--month-select")
        .addEventListener("change", () => {
          this.currentDate.setMonth(
            this.calendarDOM.querySelector(".datera--month-select").value
          );
          this.showCalendar();
        });
      this.calendarDOM
        .querySelector(".datera--month-decrement")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          this.changeMonth(-1);
          this.showCalendar();
        });
      this.calendarDOM
        .querySelector(".datera--month-increment")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          this.changeMonth(1);
          this.showCalendar();
        });

      this.renderCalendar();
      this.placeCalendar();

      if (!this.calendarDOM.parentNode) {
        document.body.append(this.calendarDOM);
      }
    },
    isDisabledDate(dateObject) {
      if (this.disabledDates) {
        return this.disabledDates.find(
          (val) => val.toDateString() == dateObject.toDateString()
        );
      }
      if (this.enabledDates) {
        return !this.enabledDates.find(
          (val) => val.toDateString() == dateObject.toDateString()
        );
      }
      return false;
    },
    renderCalendar() {
      this.calendarDOM.querySelector(".datera--grid.days").innerHTML = `
        ${this.getCalendarDays()
          .map((d) => {
            return `<button ${
              this.isDisabledDate(d) ? "disabled" : ""
            } class="datera--day ${
              new Date().toDateString() == d.toDateString() ? "today" : ""
            } ${
              d.getMonth() != this.currentDate.getMonth() ? "other" : "current"
            } ${
              this.selectionType == "single"
                ? this.value[0]?.toDateString() == d.toDateString()
                  ? "selected"
                  : ""
                : ""
            } ${
              this.selectionType == "list"
                ? this.value.find(
                    (val) => val.toDateString() == d.toDateString()
                  )
                  ? "selected"
                  : ""
                : ""
            }  ${
              this.selectionType == "range"
                ? `${
                    this.value[1] &&
                    this.value[0]?.toDateString() == d.toDateString()
                      ? "start-range"
                      : this.value[0]?.toDateString() == d.toDateString()
                      ? "selected"
                      : ""
                  } ${
                    this.value[1]?.toDateString() == d.toDateString()
                      ? "end-range"
                      : ""
                  } ${
                    this.value[0]?.toDateString() != d.toDateString() &&
                    this.value[0] < d &&
                    this.value[1] > d
                      ? "in-range"
                      : ""
                  }`
                : ""
            } " datera-date="${d.toDateString()}"><div>${d.getDate()}</div></button>`;
          })
          .join("")}
      `;

      this.calendarDOM
        .querySelector(".datera--grid.days")
        .querySelectorAll(".datera--day")
        .forEach((btn) =>
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.onDatePicked(btn.getAttribute("datera-date"));
          })
        );
      this.displayValue();

      window.addEventListener("click", (e) => this.hideCalendar(e));
    },
    onDatePicked(selectionDate) {
      const decodedSelectionDate = new Date(selectionDate);
      if (this.selectionType == "range") {
        if (!this.value[0]) {
          this.value[0] = decodedSelectionDate;
        } else if (this.value[1]) {
          this.value[0] = decodedSelectionDate;
          this.value[1] = undefined;
        } else if (!this.value[1]) {
          if (
            this.value[0]?.toDateString() != decodedSelectionDate.toDateString()
          ) {
            let betweenDates = false;
            if (this.disabledDates) {
              betweenDates = this.disabledDates.find(
                (dis) =>
                  (dis > this.value[0] && dis < decodedSelectionDate) ||
                  (dis < this.value[0] && dis > decodedSelectionDate)
              );
            } else if (this.enabledDates) {
              let currentDate = new Date(
                this.value[0] > decodedSelectionDate
                  ? decodedSelectionDate
                  : this.value[0]
              );
              let endDate = new Date(
                this.value[0] < decodedSelectionDate
                  ? decodedSelectionDate
                  : this.value[0]
              );
              while (currentDate <= endDate) {
                if (
                  !this.enabledDates.find(
                    (val) => val.toDateString() == currentDate.toDateString()
                  )
                ) {
                  betweenDates = true;
                  break;
                }
                currentDate.setDate(currentDate.getDate() + 1);
              }
            }
            if (!betweenDates) {
              this.value[1] = decodedSelectionDate;
              if (this.value[0] > this.value[1]) {
                this.value.reverse();
              }
            } else {
              this.value = [decodedSelectionDate];
            }
          }
        }
      } else if (this.selectionType == "single") {
        this.value = [decodedSelectionDate];
      } else if (this.selectionType == "list") {
        const existingDate = this.value.findIndex(
          (val) => val.toDateString() == decodedSelectionDate.toDateString()
        );

        if (existingDate > -1) {
          this.value.splice(existingDate, 1);
        } else {
          this.value.push(decodedSelectionDate);
        }
      }
      this.renderCalendar();
    },
    getCurrentMonth() {
      if (this.value) {
        return this.value;
      }
      return new Date();
    },
  };

  window.Datera = Datera;
})();
