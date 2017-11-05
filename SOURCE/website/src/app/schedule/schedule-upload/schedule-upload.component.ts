import { ChangeDetectionStrategy, Output, EventEmitter, Component, OnDestroy, OnInit } from '@angular/core';
import { FileUploader } from "ng2-file-upload/ng2-file-upload";
import * as XLSX from 'xlsx';
import { Observable, Subject, Subscription } from "rxjs";

const URL = 'https://foo.bar.com';

export interface ScheduleUploadResult {
    result: "failure" | "success";
    studytime: string;
    shift1: any;
    shift2: any;
    shift3: any;
    shift4: any;
    courses: any;
    error: any;
}

@Component({
    selector: 'schedule-upload',
    templateUrl: './schedule-upload.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduleUploadComponent implements OnInit, OnDestroy {
    public uploader: FileUploader = new FileUploader({ url: URL });
    public  subscription: Subscription;
    public  filesSubject: Subject < File > ;
    public  _uploadedXls: Observable < { result: string, studytime: string, shift1: any, shift2: any, shift3: any, shift4: any, error: any } > ;

    @Output()
    public uploadedXls: EventEmitter < ScheduleUploadResult > = new EventEmitter();

    public constructor() {
        this.filesSubject = new Subject();
        this._uploadedXls = this.filesSubject.asObservable()
            .switchMap((file: File) => {
                return new Observable < any > ((observer) => {
                        let reader: FileReader = new FileReader();
                        reader.onload = (e) => {
                            observer.next((e.target as any).result);
                        };

                        reader.readAsBinaryString(file);
                        return () => {
                            reader.abort();
                        };
                    })
                    .map((value: string) => {
                        return XLSX.read(value, { type: 'binary' });
                    }).map((wb: XLSX.WorkBook) => {
                        return wb.SheetNames.map((sheetName: string) => {
                            let sheet: XLSX.WorkSheet = wb.Sheets[sheetName];
                            var temp = sheet.A2.v.split(",");
                            var study_time = sheet.A2.v;
                            var shift1: Array < any > = [];
                            shift1.push(sheet.B5.v);
                            shift1.push(sheet.C5.v);
                            shift1.push(sheet.D5.v);
                            shift1.push(sheet.E5.v);
                            shift1.push(sheet.F5.v);
                            shift1.push(sheet.G5.v);
                            var shift2: Array < any > = [];
                            shift2.push(sheet.B7.v);
                            shift2.push(sheet.C7.v);
                            shift2.push(sheet.D7.v);
                            shift2.push(sheet.E7.v);
                            shift2.push(sheet.F7.v);
                            shift2.push(sheet.G7.v);
                            var shift3: Array < any > = [];
                            shift3.push(sheet.B10.v);
                            shift3.push(sheet.C10.v);
                            shift3.push(sheet.D10.v);
                            shift3.push(sheet.E10.v);
                            shift3.push(sheet.F10.v);
                            shift3.push(sheet.G10.v);
                            var shift4: Array < any > = [];
                            shift4.push(sheet.B12.v);
                            shift4.push(sheet.C12.v);
                            shift4.push(sheet.D12.v);
                            shift4.push(sheet.E12.v);
                            shift4.push(sheet.F12.v);
                            shift4.push(sheet.G12.v);
                            var courses: Array < any > = [];
                            var i = 16;
                            while (sheet['A' + i] !== undefined) {
                                var desired_cell;
                                var desired_value;
                                desired_cell = sheet['E' + i];
                                desired_value = (desired_cell ? desired_cell.v : undefined);
                                var E = desired_value;
                                desired_cell = sheet['F' + i];
                                desired_value = (desired_cell ? desired_cell.v : undefined);
                                var F = desired_value;

                                desired_cell = sheet['G' + i];
                                desired_value = (desired_cell ? desired_cell.v : undefined);
                                var G = desired_value;
                                var course = {
                                    'stt': sheet['A' + i].v,
                                    'code': sheet['B' + i].v,
                                    'name': sheet['C' + i].v,
                                    'teacher': sheet['D' + i].v,
                                    'ta': E,
                                    'office-hour': F,
                                    'note': G,
                                };
                                if (course.ta !== undefined) {
                                    //course.ta = course.ta.split('\n');
                                }
                                courses.push(course);
                                i++;
                            }
                            return { result: 'success', studytime: study_time, shift1: shift1, shift2: shift2, shift3: shift3, shift4: shift4, courses: courses };
                        });
                    })
                    .catch(e => Observable.of({ result: 'failure', error: e }));
            });
    }
    public ngOnInit() {
        this.subscription = this._uploadedXls.subscribe(this.uploadedXls);
    }

    public ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    public fileDropped(files: FileList): void {
        for (let i = 0; i < files.length; i++) {
            this.filesSubject.next(files[i]);
        }
    }
}
