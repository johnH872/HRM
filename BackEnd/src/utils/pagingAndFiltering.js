import { Op } from "sequelize";
import { filterType } from "../models/enums/filterType.js";

const mappingPage = (page, data) => {
    if(data) {
        page.size = data.size ?? 25,
        page.pageNumber = data.pageNumber ?? 0,
        page.totalElements = data.totalElements ?? 0;
        page.totalPages = data.totalPages ?? 0;
        page.filter = data.filter ?? [];
        page.selected = data.selected ?? [];
    }
    return page;
}

const pagingData = (page, queries) => {
    if (page) {
        queries.offset = page.pageNumber * page.size;
        queries.limit = page.size;
    }
    return queries;
}

const filterData = (page, queries) => {
    if(!queries.where) queries.where = {};
    if (page.filter?.length > 0) {
        for (let filter of page.filter) {
            switch (filter.filterType) {
                case filterType.TEXT:
                    queries.where[filter.prop] = { [Op[filter.operator]]: filter.value };
                    break;
                case filterType.DATERANGE:
                    queries.where[filter.prop] = {
                        [Op.gte]: new Date(filter.dateRange.start),
                        [Op.lte]: new Date(filter.dateRange.end),
                    }
                    break;
            }
        }
    }
    return queries;
}

export {
    pagingData,
    filterData,
    mappingPage
};