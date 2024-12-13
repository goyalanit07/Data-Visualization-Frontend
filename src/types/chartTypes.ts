export type BarData = {
    data: {
        A: number;
        B: number;
        C: number;
        D: number;
        E: number;
        F: number;
    };
};

export type LineData = {
    data: { date: string; value: number }[];
};

export type AgeGroup = null | '' | '15-25' | '>25';
export type Gender = null | '' | 'Male' | 'Female';
export type BarType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface Filters {
    startDate: string;
    endDate: string;
    ageGroup: AgeGroup;
    gender: Gender;
    selectedBar: BarType;
}