import { LightningElement } from 'lwc';
import searchProduct from '@salesforce/apex/ProductController.searchProduct';
const columns = [
    { label: 'Product Name', fieldName: 'Name', type: 'text', sortable: true},
    { label: 'Product Code', fieldName: 'ProductCode', type: 'text' },
    { label: 'Is Active', fieldName: 'IsActive', type: 'text' },
    { label: 'Family', fieldName: 'Family', type: 'picklist', sortable: true},
    { label: 'Stock Keeping Unit', fieldName: 'StockKeepingUnit', type: 'text' },
    { label: 'Industry', fieldName: 'Industry', type: 'picklist' },
    { label: 'Quantity Unit Of Measure', fieldName: 'QuantityUnitOfMeasure', type: 'text' }
];

export default class PocSearchScreenLWC extends LightningElement {
    searchKeyWord;
    data = [];
    columns = columns;
    isShowSearchResult = false;
    isShowFilterLayout = false;
    numberOfResult;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy = 'Name';
    objectApiName = 'Product2';
    rowLimit = 5;
    rowOffSet=0;
    tableElement;
    maxRows = 100
    changeHandler(event) {
        this.searchKeyWord = event.target.value;
    }
    doSearchClick() {
        console.log('searchKeyWord: ', this.searchKeyWord)
        searchProduct({ Keyword: this.searchKeyWord, Orderby: this.sortedBy, OrderDir: this.sortDirection, objectApiName: this.objectApiName,
                        limitSize: this.rowLimit , offset : this.rowOffSet })
            .then((result) => {
                console.log('result: ', result)
                this.isShowSearchResult = true
                this.data = this.data.concat(result);
                console.log('data: ',this.data)
                this.numberOfResult = '(' + this.data.length + ')'
                if(this.tableElement){
                    this.tableElement.isLoading = false;
                }
                console.log('hlw.....1')
                //this.tableElement.enableInfiniteLoading = false;
                if (this.data.length  >= this.maxRows) {
                    this.tableElement.enableInfiniteLoading = false;
                    this.loadMoreStatus = 'No more data to load';
                }
                console.log('hlw.....2')
            })
            .catch((error) => {
                console.log('error: ', error)
            });
    }
    showFilterLayout() {
        this.isShowFilterLayout = !this.isShowFilterLayout
    }
    onHandleSort(event) {
        console.log('event: ', event)
        const { fieldName: sortedBy, sortDirection } = event.detail;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
        this.data = []
        this.rowOffSet = 0
        this.tableElement.enableInfiniteLoading = true;
        this.doSearchClick()
    }
    loadMoreData(event) {
        if(event.target){
            event.target.isLoading = true;
        }
        this.tableElement = event.target;

        this.rowOffSet = this.rowOffSet + this.rowLimit;
        console.log('this.rowOffSet: ',this.rowOffSet)
        this.doSearchClick()
        if (this.data.length  >= this.maxRows) {
            this.tableElement.enableInfiniteLoading = false;
            this.loadMoreStatus = 'No more data to load';
        }
    }
}