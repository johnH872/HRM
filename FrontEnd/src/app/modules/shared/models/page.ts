import { RangeDate } from "./dateRangeModel";

/**
 * An object used to get page information from the server
 */
export class Page {
    // The number of elements in the page
    size: number = 0;
    // The total number of elements
    totalElements: number = 0;
    // The total number of pages
    totalPages: number = 0;
    // The current page number
    pageNumber: number = 0;
}

export class PagingRangeDateFilter extends Page {
    rangeDateValue?: RangeDate;
    isToDay: boolean = false;
}