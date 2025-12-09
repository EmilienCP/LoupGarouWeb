export enum FieldsLength {
    MAX_USERNAME,
    MAX_PASSWORD,
    MAX_EMAIL,
    MAX_CONCENTRATION_NAME,
    MAX_COURSE_ACRONYM,
    MAX_NOTES,
    MAX_COURSE_URL,
    MAX_COURSE_TITLE,
    MAX_COURSE_SHORT_TITLE,
    MAX_INT,
    MAX_FLOAT,
    MAX_PROGRAMNATURE_NAME,
    MAX_FIELD_NAME,
    MAX_OPTBOX_NAME,
    MAX_SECTION_NAME,
    MAX_PATH_NAME,
    MAX_ADMISSION_YEAR,
    MAX_TRIMESTER_YEAR,
    MAX_TRIMESTERS
}

export const getFieldLength = (field: FieldsLength) => {
    switch (field) {
        case (FieldsLength.MAX_USERNAME):
        case (FieldsLength.MAX_PASSWORD): return 32;

        case (FieldsLength.MAX_EMAIL):
        case (FieldsLength.MAX_COURSE_TITLE): return 128;

        case (FieldsLength.MAX_CONCENTRATION_NAME):
        case (FieldsLength.MAX_FIELD_NAME): return 45;
        case (FieldsLength.MAX_PROGRAMNATURE_NAME): return 20;
        
        case (FieldsLength.MAX_COURSE_ACRONYM): return 12;
        
        case (FieldsLength.MAX_NOTES): return 512;
        case (FieldsLength.MAX_COURSE_URL): return 1024;

        case (FieldsLength.MAX_INT): return Number.MAX_SAFE_INTEGER;
        case (FieldsLength.MAX_FLOAT): return Number.MAX_SAFE_INTEGER; //it's not, but those values are used for triplet horaire, so it should be ok. 

        case (FieldsLength.MAX_OPTBOX_NAME):
        case (FieldsLength.MAX_SECTION_NAME): return 58;

        case (FieldsLength.MAX_PATH_NAME): return 30;

        case (FieldsLength.MAX_ADMISSION_YEAR): return 2150; //this way, a trimester with entry year 2150 could have maximum 5 years of trimesters 

        case (FieldsLength.MAX_TRIMESTER_YEAR): return 2155; //this is MySQL year maximum 

        case (FieldsLength.MAX_TRIMESTERS): return 48;

        default: return 0;
    }
}