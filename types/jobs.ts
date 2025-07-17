
export type JobStatus = 'Completed' | 'Pending' | 'In-Progress';
export type jobtype={
    start_time: string | number | (string | number)[] | null | undefined;
    end_time: string | number | (string | number)[] | null | undefined;
    property: any;
    instruction: string | number | (string | number)[] | null | undefined;
    description: string | number | (string | number)[] | null | undefined;
    price: string | number | (string | number)[] | null | undefined;
    id:string;
    date:string;
    name:string;
    status:JobStatus;
    dueTime:string;
    address:string;
    imageUrl:string;
}

