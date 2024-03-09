import { filterOperator, filterType } from "../enums/filterType.js";

export class Page {
    // The number of elements in the page
    size = 25;
    // The total number of elements
    totalElements = 0;
    // The total number of pages
    totalPages = 0;
    // The current page number
    pageNumber = 0;

    filter = [];
    selected = [];
}

export class FilterMapping {
    value;
    dateRange;
    filterType = filterType.TEXT;
    prop;
    operator = filterOperator.SUBSTRING;
}