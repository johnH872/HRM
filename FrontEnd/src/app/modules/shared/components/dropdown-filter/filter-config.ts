import { Observable } from "rxjs";
import { FilterType } from "../../enum/filter-type.enum";

export class FilterConfig {
    filterType: FilterType;
    displayText: string;
    displayValue: string;
    filterValue: any[] | Observable<any[]>;
    firstLoad: boolean = false;
    displayImg: string;
}
