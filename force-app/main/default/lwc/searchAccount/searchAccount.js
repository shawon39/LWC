import { LightningElement, track, api, wire } from 'lwc';
import filterAccounts from '@salesforce/apex/AccountController.filterAccounts';
import getTotalNumberOfRows from '@salesforce/apex/AccountController.getTotalNumberOfRows';

const columns = [
    {label: 'Account Parent Name', fieldName: 'AccountUrl', type: 'url', typeAttributes: {label: { fieldName: 'AccountName' },target: '_blank'},  sortable: true},
    {label: 'Employees', fieldName: 'NumberOfEmployees', type: 'number', cellAttributes: { class: { fieldName: `format`} }, sortable: true },
    {label: 'Annual Revenue', fieldName: 'AnnualRevenue', type: 'currency',  sortable: true },
    {label: 'Industry', fieldName: 'Industry', type: 'picklist', cellAttributes: { class: { fieldName: `format`} },  sortable: true },
    {label: 'Phone', fieldName: 'Phone', type: 'phone',  sortable: true},
    {label: 'Type', fieldName: 'Type', type: 'picklist',  sortable: true}
];

export default class SearchAccount extends LightningElement {
    @track accounts = [];
    columns = columns;
    @track sortBy;
    @track sortDirection;
    @track dataLength;
    @track buttonClicked;
    @track isShowSearchResult;

    filterValues = [];
    @track loadMoreStatus;
    @api totalNumberOfRows;
    @track offSet = 0;
    @track rowLimit = 50;
    tableElement;

    @wire(getTotalNumberOfRows)
    getAccountCount ({error, data}) {
        if (error) {
            this.totalNumberOfRows = undefined;
        } else if (data) {
            this.totalNumberOfRows = data;
        }
    }

    loadMoreData(event) {
        if(event.target){
            event.target.isLoading = true;
        }
        this.tableElement = event.target;
        this.offSet = this.offSet + this.rowLimit;
        this.handleSearch()
        if (this.accounts.length >= this.totalNumberOfRows) {
            this.tableElement = event.target.enableInfiniteLoading = false;
            this.loadMoreStatus = 'No more data to load';
        }
    }

    handleToggle() {
        this.buttonClicked = !this.buttonClicked;
    }

    handleSearch() {
        if(!this.validationCheck()) {
            return;
        }
        const div = this.template.querySelectorAll(".myInput");
        div.forEach(element => {
            this.filterValues.push(element.value);
            element.value = null;
        });
        this.buttonClicked = false;

        filterAccounts({filterValues: this.filterValues, rowLimit: this.rowLimit, offSet : this.offSet}).then(res => {

            res = res.map(record => ({
                AccountName :  record.Account__r ? record.Account__r.Name : '',
                AccountUrl : record.Account__c ? `/${record.Account__c}` : '',
                ...record
            }));

            res.forEach(ele => {
                ele.format = ele.Industry == 'Energy' ? 'slds-theme_error slds-text-color_default' : '';
            });

            this.accounts = this.accounts.concat(res);
            this.dataLength = this.accounts.length;
            this.isShowSearchResult = true;
            if(this.tableElement){
                this.tableElement.isLoading = false;
            }
            if (this.accounts.length  >= this.totalNumberOfRows) {
                this.tableElement.enableInfiniteLoading = false;
                this.loadMoreStatus = 'No more data to load';
            }
        })
        .catch(err => {
            console.log('Something wrong');
        })
    }

    validationCheck() {
        let isValid = true;
        const div = this.template.querySelectorAll(".myInput");
        div.forEach(element => {
            if(element.value == '') {
                isValid = false;
                element.setCustomValidity("Please give the correct inputs.");
            }
            else {
                element.setCustomValidity("");
            }
            element.reportValidity();
        });

        const dateFields = this.template.querySelectorAll(".myDateInput");
        if(dateFields.length) {
            if(dateFields[0].value > dateFields[1].value) {
                isValid = false;
                dateFields[0].setCustomValidity("Future date is not possible Future date is not possible.");
            }
            else {
                dateFields[0].setCustomValidity("");
            }
            dateFields[0].reportValidity();
        }
        return isValid;
    }

    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }
    sortData(fieldName, direction) {
        let parseData = JSON.parse(JSON.stringify(this.accounts));
        let keyValue = (a) => {
            return a[fieldName];
        };
        let isReverse = direction === 'asc' ? 1: -1;
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : '';
            y = keyValue(y) ? keyValue(y) : '';
            return isReverse * ((x > y) - (y > x));
        });
        this.accounts = parseData;
    }

}