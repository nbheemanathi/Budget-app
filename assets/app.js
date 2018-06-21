


var budgetController = (function () {
    //Function constructor (beings with capltal letters)
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calPercentage = function (totalIncome) {
        if (totalIncome > 0)
            this.percentage = Math.round((this.value / totalIncome) * 100);
        else
            this.percentage = -1;
    }
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(element => {
            sum += element.value;
        });
        data.totals[type] = sum;
    };

    return {
        addItem: function (type, desc, val) {
            var newItem, ID;
            //ID TO BE EQUAL LAST ID + 1
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            }
            else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteItem: function (type, id) {
            var ids, index;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }



        },
        calculateBudget: function () {

            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate percentage os of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }

        }
        , getBudget: function () {
            return {
                budget: data.budget,
                percentage: data.percentage,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(element => {
                element.calPercentage(data.totals.inc);
            });
        },
        getPercentages: function () {
            var allPercentages = data.allItems.exp.map(function (e) {
                return e.getPercentage();

            });
            return allPercentages;
        },
        testing: function () {
            console.log(data);
        }
    }

})();


var userInterfaceController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputdescription: '.add__description',
        inputvalue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetContainer: '.budget__value',
        budgetIncomeContainer: '.budget__income--value',
        budgetExpenseContainer: '.budget__expenses--value',
        percentageContainer: '.budget__expenses--percentage',
        container: '.container',
        itemPercentagesContainer: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    var formatNumber = function (num, type) {
        //+ / - before the number
        // calculate the absolute part           
        var numSplit, int, decimal, sign;

        num = Math.abs(num);
        num = num.toFixed(2); // decimal of two zeros

        numSplit = num.split('.');
        int = numSplit[0];
        decimal = numSplit[1];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        }


        return (type === 'exp' ? '- ' : '+ ') + int + '.' + decimal;
        //add decimal points
        // , separated the number values
    };
    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                desc: document.querySelector(DOMstrings.inputdescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputvalue).value)
            }

        },

        addListItem: function (obj, type) {
            var html, newHtml, element;

            //create html string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> ' +
                    '<div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div>' +
                    '<div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div></div>';
            }
            else {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%">' +
                    '<div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div>' +
                    '<div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }


            //replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //insert into Dom element            
            var domInsrt = document.querySelector(element);
            domInsrt.insertAdjacentHTML('beforeend', newHtml);

        },
        deleteListItem: function (selectorId) {
            var element = document.getElementById(selectorId);
            element.parentNode.removeChild(element);
        },
        getDOMstrings: function () {
            return DOMstrings;
        },

        clearFields: function () {
            var fields;
            fields = document.querySelectorAll(DOMstrings.inputdescription + ', ' + DOMstrings.inputvalue);
            var fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(element => {
                element.value = '';
            });
            fieldsArr[0].focus();
        },
        displayPercentages: function (data) {
            var fields;
            fields = document.querySelectorAll(DOMstrings.itemPercentagesContainer);           
            nodeListForEach(fields, function (current, index) {
                if (data[index] > 0) {
                    current.textContent = data[index] + '%';
                }
                else {
                    current.textContent = '---';
                }

            });
        },
        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetContainer).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.budgetIncomeContainer).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.budgetExpenseContainer).textContent = formatNumber(obj.totalExpenses, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageContainer).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DOMstrings.percentageContainer).textContent = '---';
            }

        },
        displayMonth: function(){

            var now = new Date();
            months = ['january','February', 'March', 'April', 'May','June','July','August','September','October', 'November','December' ]
            var month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' '+  now.getFullYear();

        },
        updateUI: function(){
           var fields = document.querySelectorAll(DOMstrings.inputType + ',' +
           DOMstrings.inputdescription + ',' +
           DOMstrings.inputvalue);

            nodeListForEach(fields, function(current, index){
                current.classList.toggle('red-focus');                
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');


        }

    }


})();

var Controller = (function (budgetCtrl, UiCtrl) {

    var setUpEventlisteners = function () {
        var DOM = UiCtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UiCtrl.updateUI);
    };

    var updateBudget = function () {
        // 1. calculate budget      
        budgetController.calculateBudget()

        // 2.return budget
        var dataBudget = budgetController.getBudget();

        // 3. Display calculated budget in ui        
        UiCtrl.displayBudget(dataBudget);
    }

    var updatePercentages = function () {

        //calculate %
        budgetController.calculatePercentages();
        //read % from budget controller
        var percentages = budgetController.getPercentages();
        // update ui        
        UiCtrl.displayPercentages(percentages);

    }

    var ctrlAddItem = function () {

        var Input, newItem;

        // 1. Get field input data
        input = UiCtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. add item to budget controller
            newItem = budgetController.addItem(input.type, input.desc, input.value);

            // 3. add new item to ui

            UiCtrl.addListItem(newItem, input.type);
            UiCtrl.clearFields();//clear fields after add

            // 4. calculate and update Budget
            updateBudget();

            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemId, ID, type;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemId) {
            ID = parseInt(itemId.split('-')[1]);
            type = itemId.split('-')[0];

            // Delete item from data structure
            budgetCtrl.deleteItem(type, ID);

            // delete item from user interface
            UiCtrl.deleteListItem(itemId);

            // update and show new budget
            updateBudget();

            updatePercentages();
        }

    };
    return {
        init: function () {
            setUpEventlisteners();
            UiCtrl.displayMonth();
            UiCtrl.displayBudget({
                budget: 0,
                percentage: -1,
                totalIncome: 0,
                totalExpenses: 0
            });
        }
    }
})(budgetController, userInterfaceController);

Controller.init();


