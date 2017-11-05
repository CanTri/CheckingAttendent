import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { FileUploader } from "ng2-file-upload/ng2-file-upload";
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import * as JSZip from 'jszip';

import { AppConfig } from '../config';
@Injectable()
export class ExcelService {

    public constructor(public http: Http) {}
    public s2ab(s): any {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }
    public readStudentListFile(file: any): Observable < { result: string, student_list: Array < any > , message: string } > {
        return new Observable < any > ((observer) => {
                let reader: FileReader = new FileReader();
                reader.onload = function(e: any) {
                    var binaryString = e.target.result;
                    var wb: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary' });
                    observer.next(wb);
                };
                reader.readAsBinaryString(file);
                return () => {
                    reader.abort();
                };
            }).map((wb: XLSX.WorkBook) => {
                return wb.SheetNames.map((sheetName: string) => {
                    let sheet: XLSX.WorkSheet = wb.Sheets[sheetName];
                    var i = 1;
                    while (sheet['A' + i] !== undefined) {
                        if (sheet['A' + i].v.toLowerCase() == 'stt') {
                            i++;
                            break;
                        }
                        i++;
                    }
                    var students: Array < any > = [];
                    while (sheet['A' + i] !== undefined) {
                        var desired_cell;
                        var desired_value;
                        desired_cell = sheet['B' + i];
                        desired_value = (desired_cell ? desired_cell.v : undefined);
                        var B = desired_value;
                        if (B == undefined) {
                            return { result: 'failure', message: 'Student code is required at line ' + i + ' : ' + file['name'] };
                        }
                        desired_cell = sheet['C' + i];
                        desired_value = (desired_cell ? desired_cell.v : undefined);
                        var C = desired_value;

                        desired_cell = sheet['D' + i];
                        desired_value = (desired_cell ? desired_cell.v : undefined);
                        var D = desired_value;

                        var student = {
                            'stt': sheet['A' + i].v,
                            'stud_id': B,
                            'name': C,
                            'phone': D,
                        };
                        students.push(student);
                        i++;
                    }
                    return { result: 'success', message: 'Success', student_list: students };
                });
            })
            .catch((error: any) => Observable.of({ result: 'failure', message: error }));
    }
    public writeStudentSearchList(student_list: any, file_name: string) {
        var ws_name = "Sheet1";
        var wb = { SheetNames: [], Sheets: {} };
        wb.SheetNames.push(ws_name);
        var ws = {};
        ws[XLSX.utils.encode_cell({ c: 0, r: 0 })] = { v: 'STT' };
        ws[XLSX.utils.encode_cell({ c: 1, r: 0 })] = { v: 'MSSV' };
        ws[XLSX.utils.encode_cell({ c: 2, r: 0 })] = { v: 'Họ Tên' };
        ws[XLSX.utils.encode_cell({ c: 3, r: 0 })] = { v: 'SĐT' };
        ws[XLSX.utils.encode_cell({ c: 4, r: 0 })] = { v: 'Lớp' };
        for (var i = 1; i <= student_list.length; i++) {
            ws[XLSX.utils.encode_cell({ c: 0, r: i })] = { v: i };
            ws[XLSX.utils.encode_cell({ c: 1, r: i })] = { v: student_list[i - 1].code };
            ws[XLSX.utils.encode_cell({ c: 2, r: i })] = { v: student_list[i - 1].name };
            ws[XLSX.utils.encode_cell({ c: 3, r: i })] = { v: student_list[i - 1].phone };
            ws[XLSX.utils.encode_cell({ c: 4, r: i })] = { v: student_list[i - 1].class_name };
        }
        ws['!ref'] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: 4, r: student_list.length } });
        wb.Sheets[ws_name] = ws;
        var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: false, type: 'binary' });
        if (file_name == '') file_name = 'students';
        FileSaver.saveAs(new Blob([this.s2ab(wbout)], { type: "application/octet-stream" }), file_name + ".xlsx");
    }
    public writeStudentLists(student_lists: any) {
        var zip = new JSZip();
        for (var j = 0; j < student_lists.length; j++) {
            var student_list = student_lists[j];
            var ws_name = "Sheet1";
            var wb = { SheetNames: [], Sheets: {} };
            wb.SheetNames.push(ws_name);
            var ws = {};
            ws[XLSX.utils.encode_cell({ c: 0, r: 0 })] = { v: 'STT' };
            ws[XLSX.utils.encode_cell({ c: 1, r: 0 })] = { v: 'MSSV' };
            ws[XLSX.utils.encode_cell({ c: 2, r: 0 })] = { v: 'Họ Tên' };
            ws[XLSX.utils.encode_cell({ c: 3, r: 0 })] = { v: 'SĐT' };
            ws[XLSX.utils.encode_cell({ c: 4, r: 0 })] = { v: 'Lớp' };
            for (var i = 1; i <= student_list.length; i++) {
                ws[XLSX.utils.encode_cell({ c: 0, r: i })] = { v: i };
                ws[XLSX.utils.encode_cell({ c: 1, r: i })] = { v: student_list[i - 1].code };
                ws[XLSX.utils.encode_cell({ c: 2, r: i })] = { v: student_list[i - 1].name };
                ws[XLSX.utils.encode_cell({ c: 3, r: i })] = { v: student_list[i - 1].phone };
                ws[XLSX.utils.encode_cell({ c: 4, r: i })] = { v: student_list[i - 1].class_name };
            }
            ws['!ref'] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: 4, r: student_list.length } });
            wb.Sheets[ws_name] = ws;

            var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: false, type: 'binary' });
            zip.file(student_list[0].class_name + ".xlsx", new Blob([this.s2ab(wbout)]));
        }
        zip.generateAsync({ type: "blob" })
            .then(function(content) {
                // see FileSaver.js
                FileSaver.saveAs(content, "students.zip");
            });
    }

    public writeExamineesLists(student_lists: any, class_has_courses: any) {
        var zip = new JSZip();
        for (var j = 0; j < student_lists.length; j++) {
            var student_list = student_lists[j];
            var class_has_course = class_has_courses[j];

            var ws_name = "Sheet1";
            var wb = { SheetNames: [], Sheets: {} };
            wb.SheetNames.push(ws_name);
            var ws = {};
            ws[XLSX.utils.encode_cell({ c: 0, r: 0 })] = { v: 'STT' };
            ws[XLSX.utils.encode_cell({ c: 1, r: 0 })] = { v: 'MSSV' };
            ws[XLSX.utils.encode_cell({ c: 2, r: 0 })] = { v: 'Họ' };
            ws[XLSX.utils.encode_cell({ c: 3, r: 0 })] = { v: 'Tên' };
            for (var i = 1; i <= student_list.length; i++) {
                ws[XLSX.utils.encode_cell({ c: 0, r: i })] = { v: i };
                ws[XLSX.utils.encode_cell({ c: 1, r: i })] = { v: student_list[i - 1].student_code };
                ws[XLSX.utils.encode_cell({ c: 2, r: i })] = { v: student_list[i - 1].first_name };
                ws[XLSX.utils.encode_cell({ c: 3, r: i })] = { v: student_list[i - 1].last_name };
            }
            ws['!ref'] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: 4, r: student_list.length } });
            wb.Sheets[ws_name] = ws;

            var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: false, type: 'binary' });
            zip.file(class_has_course.code + ' - ' + class_has_course.name + ' - ' + class_has_course.class_name + ".xlsx", new Blob([this.s2ab(wbout)]));
        }
        zip.generateAsync({ type: "blob" })
            .then(function(content) {
                // see FileSaver.js
                FileSaver.saveAs(content, "examinees.zip");
            });
    }

    public readTeacherListFile(file: any): Observable < { result: string, teacher_list: Array < any > , message: string } > {
        return new Observable < any > ((observer) => {
                let reader: FileReader = new FileReader();
                reader.onload = function(e: any) {
                    var binaryString = e.target.result;
                    var wb: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary' });
                    observer.next(wb);
                };
                reader.readAsBinaryString(file);
                return () => {
                    reader.abort();
                };
            }).map((wb: XLSX.WorkBook) => {
                return wb.SheetNames.map((sheetName: string) => {
                    let sheet: XLSX.WorkSheet = wb.Sheets[sheetName];
                    var i = 1;
                    while (sheet['A' + i] !== undefined) {
                        if (sheet['A' + i].v.toLowerCase() == 'stt') {
                            i++;
                            break;
                        }
                        i++;
                    }
                    var teachers: Array < any > = [];
                    while (sheet['A' + i] !== undefined) {
                        var desired_cell;
                        var desired_value;
                        desired_cell = sheet['B' + i];
                        desired_value = (desired_cell ? desired_cell.v : undefined);
                        var B = desired_value;

                        desired_cell = sheet['C' + i];
                        desired_value = (desired_cell ? desired_cell.v : undefined);
                        var C = desired_value;

                        if (B == undefined && C == undefined) {
                            return { result: 'failure', message: 'Teacher name is required at line ' + i + ' : ' + file['name'] };
                        }

                        desired_cell = sheet['D' + i];
                        desired_value = (desired_cell ? desired_cell.v : undefined);
                        var D = desired_value;

                        desired_cell = sheet['E' + i];
                        desired_value = (desired_cell ? desired_cell.v : undefined);
                        var E = desired_value;

                        if (E == undefined) {
                            return { result: 'failure', message: 'Teacher email is required at line ' + i + ' : ' + file['name'] };
                        }

                        var teacher = {
                            'stt': sheet['A' + i].v,
                            'first_name': B,
                            'last_name': C,
                            'phone': D,
                            'email': E
                        };
                        teachers.push(teacher);
                        i++;
                    }
                    return { result: 'success', message: 'Success', teacher_list: teachers };
                });
            })
            .catch((error: any) => Observable.of({ result: 'failure', message: error }));
    }
    public writeTeacherSearchList(teacher_list: any, file_name: string) {
        var ws_name = "Sheet1";
        var wb = { SheetNames: [], Sheets: {} };
        wb.SheetNames.push(ws_name);
        var ws = {};
        ws[XLSX.utils.encode_cell({ c: 0, r: 0 })] = { v: 'STT' };
        ws[XLSX.utils.encode_cell({ c: 1, r: 0 })] = { v: 'Họ' };
        ws[XLSX.utils.encode_cell({ c: 2, r: 0 })] = { v: 'Tên' };
        ws[XLSX.utils.encode_cell({ c: 3, r: 0 })] = { v: 'SĐT' };
        ws[XLSX.utils.encode_cell({ c: 4, r: 0 })] = { v: 'Email' };
        for (var i = 1; i <= teacher_list.length; i++) {
            ws[XLSX.utils.encode_cell({ c: 0, r: i })] = { v: i };
            ws[XLSX.utils.encode_cell({ c: 1, r: i })] = { v: teacher_list[i - 1].first_name };
            ws[XLSX.utils.encode_cell({ c: 2, r: i })] = { v: teacher_list[i - 1].last_name };
            ws[XLSX.utils.encode_cell({ c: 3, r: i })] = { v: teacher_list[i - 1].phone };
            ws[XLSX.utils.encode_cell({ c: 4, r: i })] = { v: teacher_list[i - 1].email };
        }
        ws['!ref'] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: 4, r: teacher_list.length } });
        wb.Sheets[ws_name] = ws;
        var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: false, type: 'binary' });
        if (file_name == '') file_name = 'teachers';
        FileSaver.saveAs(new Blob([this.s2ab(wbout)], { type: "application/octet-stream" }), file_name + ".xlsx");
    }


    public readCourseListFile(file: any): Observable < { result: string, course_list: Array < any > , message: string } > {
        return new Observable < any > ((observer) => {
                let reader: FileReader = new FileReader();
                reader.onload = function(e: any) {
                    var binaryString = e.target.result;
                    var wb: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary' });
                    observer.next(wb);
                };
                reader.readAsBinaryString(file);
                return () => {
                    reader.abort();
                };
            }).map((wb: XLSX.WorkBook) => {
                return wb.SheetNames.map((sheetName: string) => {
                    let sheet: XLSX.WorkSheet = wb.Sheets[sheetName];
                    var i = 1;
                    while (sheet['A' + i] !== undefined) {
                        if (sheet['A' + i].v.toLowerCase() == 'stt') {
                            i++;
                            break;
                        }
                        i++;
                    }
                    var courses: Array < any > = [];
                    while (sheet['A' + i] !== undefined) {
                        var desired_cell;
                        var desired_value;
                        desired_cell = sheet['B' + i];
                        desired_value = (desired_cell ? desired_cell.v : undefined);
                        var B = desired_value;
                        if (B == undefined) {
                            return { result: 'failure', message: 'Course code required at line ' + i + ' : ' + file['name'] };
                        }
                        desired_cell = sheet['C' + i];
                        desired_value = (desired_cell ? desired_cell.v : undefined);
                        var C = desired_value;
                        if (C == undefined) {
                            return { result: 'failure', message: 'Course name required at line ' + i + ' : ' + file['name'] };
                        }
                        desired_cell = sheet['D' + i];
                        desired_value = (desired_cell ? desired_cell.v : undefined);
                        var D = desired_value;
                        if (D == undefined) {
                            return { result: 'failure', message: 'Lecturers required at line ' + i + ' : ' + file['name'] };
                        } else {
                            D = D.split('\r\n');
                        }
                        desired_cell = sheet['E' + i];
                        desired_value = (desired_cell ? desired_cell.v : undefined);
                        var E = desired_value;
                        if (E != undefined && E != NaN) E = E.split('\r\n');

                        desired_cell = sheet['F' + i];
                        desired_value = (desired_cell ? desired_cell.v : undefined);
                        var F = desired_value;

                        desired_cell = sheet['G' + i];
                        desired_value = (desired_cell ? desired_cell.v : undefined);
                        var G = desired_value;

                        var course = {
                            'stt': sheet['A' + i].v,
                            'code': B,
                            'name': C,
                            'lecturers': D,
                            'TAs': E,
                            'office_hour': F,
                            'note': G,
                        };
                        courses.push(course);
                        i++;
                    }
                    return { result: 'success', message: 'Success', course_list: courses };
                });
            })
            .catch((error: any) => Observable.of({ result: 'failure', message: error }));
    }
    public writeCourseSearchList(course_list: any, file_name: string) {
        var ws_name = "Sheet1";
        var wb = { SheetNames: [], Sheets: {} };
        wb.SheetNames.push(ws_name);
        var ws = {};
        ws[XLSX.utils.encode_cell({ c: 0, r: 0 })] = { v: 'STT' };
        ws[XLSX.utils.encode_cell({ c: 1, r: 0 })] = { v: 'Mã môn' };
        ws[XLSX.utils.encode_cell({ c: 2, r: 0 })] = { v: 'Tên môn' };
        ws[XLSX.utils.encode_cell({ c: 3, r: 0 })] = { v: 'GV Lý Thuyết' };
        ws[XLSX.utils.encode_cell({ c: 4, r: 0 })] = { v: 'Trợ giảng' };
        ws[XLSX.utils.encode_cell({ c: 5, r: 0 })] = { v: 'Office hour' };
        ws[XLSX.utils.encode_cell({ c: 6, r: 0 })] = { v: 'Ghi chú' };
        for (var i = 1; i <= course_list.length; i++) {
            ws[XLSX.utils.encode_cell({ c: 0, r: i })] = { v: i };
            ws[XLSX.utils.encode_cell({ c: 1, r: i })] = { v: course_list[i - 1].code };
            ws[XLSX.utils.encode_cell({ c: 2, r: i })] = { v: course_list[i - 1].name };
            ws[XLSX.utils.encode_cell({ c: 3, r: i })] = { v: course_list[i - 1].lecturers };
            if (course_list[i - 1].TAs) ws[XLSX.utils.encode_cell({ c: 4, r: i })] = { v: course_list[i - 1].TAs };
            if (course_list[i - 1].office_hour) ws[XLSX.utils.encode_cell({ c: 5, r: i })] = { v: course_list[i - 1].office_hour };
            if (course_list[i - 1].note) ws[XLSX.utils.encode_cell({ c: 6, r: i })] = { v: course_list[i - 1].note };
        }
        ws['!ref'] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: 6, r: course_list.length } });
        wb.Sheets[ws_name] = ws;
        var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: false, type: 'binary' });
        if (file_name == '') file_name = 'courses';
        FileSaver.saveAs(new Blob([this.s2ab(wbout)], { type: "application/octet-stream" }), file_name + ".xlsx");
    }
    public writeCourseLists(course_lists: any) {
        var zip = new JSZip();
        for (var j = 0; j < course_lists.length; j++) {
            if (course_lists[j].length == 0) continue;
            var course_list = course_lists[j];
            var ws_name = "Sheet1";
            var wb = { SheetNames: [], Sheets: {} };
            wb.SheetNames.push(ws_name);
            var ws = {};
            ws[XLSX.utils.encode_cell({ c: 0, r: 0 })] = { v: 'STT' };
            ws[XLSX.utils.encode_cell({ c: 1, r: 0 })] = { v: 'Mã môn' };
            ws[XLSX.utils.encode_cell({ c: 2, r: 0 })] = { v: 'Tên môn' };
            ws[XLSX.utils.encode_cell({ c: 3, r: 0 })] = { v: 'GV Lý Thuyết' };
            ws[XLSX.utils.encode_cell({ c: 4, r: 0 })] = { v: 'Trợ giảng' };
            ws[XLSX.utils.encode_cell({ c: 5, r: 0 })] = { v: 'Office hour' };
            ws[XLSX.utils.encode_cell({ c: 6, r: 0 })] = { v: 'Ghi chú' };
            for (var i = 1; i <= course_list.length; i++) {
                ws[XLSX.utils.encode_cell({ c: 0, r: i })] = { v: i };
                ws[XLSX.utils.encode_cell({ c: 1, r: i })] = { v: course_list[i - 1].code };
                ws[XLSX.utils.encode_cell({ c: 2, r: i })] = { v: course_list[i - 1].name };
                ws[XLSX.utils.encode_cell({ c: 3, r: i })] = { v: course_list[i - 1].lecturers };
                if (course_list[i - 1].TAs) ws[XLSX.utils.encode_cell({ c: 4, r: i })] = { v: course_list[i - 1].TAs };
                if (course_list[i - 1].office_hour) ws[XLSX.utils.encode_cell({ c: 5, r: i })] = { v: course_list[i - 1].office_hour };
                if (course_list[i - 1].note) ws[XLSX.utils.encode_cell({ c: 6, r: i })] = { v: course_list[i - 1].note };
            }
            ws['!ref'] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: 6, r: course_list.length } });
            wb.Sheets[ws_name] = ws;

            var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: false, type: 'binary' });
            zip.file(course_list[0].class_name + ".xlsx", new Blob([this.s2ab(wbout)]));
        }
        zip.generateAsync({ type: "blob" })
            .then(function(content) {
                // see FileSaver.js
                FileSaver.saveAs(content, "courses.zip");
            });
    }

    public writeScheduleSearchList(course_list: any, file_name: string) {
        var ws_name = "Sheet1";
        var wb = { SheetNames: [], Sheets: {} };
        wb.SheetNames.push(ws_name);
        var ws = {};
        var wscols = [
            {wch:20},
            {wch:20},
            {wch:20},
            {wch:20},
            {wch:20},
            {wch:20},
            {wch:20}
        ];
        ws['!cols'] = wscols;
        var sessions = ['','','','','','','','','','','','','','','', '','','','', '','','','','',];
        var time = ['(LT)7:30-9:10 \r\n (TH)7:30-9:30','(LT)9:30-11:10 \r\n (TH)9:30-11:30',
                    '(LT)13:30-15:10 \r\n (TH)13:30-15:30','(LT)15:30-17:10 \r\n (TH)15:30-17:30'];
        ws[XLSX.utils.encode_cell({ c: 0, r: 7 })] = { v: 'STT' };
        ws[XLSX.utils.encode_cell({ c: 1, r: 7 })] = { v: 'Mã môn' };
        ws[XLSX.utils.encode_cell({ c: 2, r: 7 })] = { v: 'Tên môn' };
        ws[XLSX.utils.encode_cell({ c: 3, r: 7 })] = { v: 'GV Lý Thuyết' };
        ws[XLSX.utils.encode_cell({ c: 4, r: 7 })] = { v: 'Trợ giảng' };
        ws[XLSX.utils.encode_cell({ c: 5, r: 7 })] = { v: 'Office hour' };
        ws[XLSX.utils.encode_cell({ c: 6, r: 7 })] = { v: 'Ghi chú' };
        for (var i = 0; i < course_list.length; i++) {
            ws[XLSX.utils.encode_cell({ c: 0, r: i + 8 })] = { v: i };
            ws[XLSX.utils.encode_cell({ c: 1, r: i + 8 })] = { v: course_list[i].code };
            ws[XLSX.utils.encode_cell({ c: 2, r: i + 8 })] = { v: course_list[i].name };
            ws[XLSX.utils.encode_cell({ c: 3, r: i + 8 })] = { v: course_list[i].lecturers };
            if (course_list[i].TAs) ws[XLSX.utils.encode_cell({ c: 4, r: i + 8 })] = { v: course_list[i].TAs };
            if (course_list[i].office_hour) ws[XLSX.utils.encode_cell({ c: 5, r: i + 8 })] = { v: course_list[i].office_hour };
            if (course_list[i].note) ws[XLSX.utils.encode_cell({ c: 6, r: i + 8})] = { v: course_list[i].note };

            var schedules = course_list[i].schedules.split(';');
            for (var j = 0; j < schedules.length; j++) {
                var temp = schedules[j].split('-');
                var index = temp[0];
                var room = temp[1];
                var type = temp[2];
                sessions[index] += course_list[i].code + '-' + course_list[i].class_name + '-' + room + '-' + type + '\r\n';
            }
        }
        ws[XLSX.utils.encode_cell({ c: 1, r: 0 })] = { v: '2' };
        ws[XLSX.utils.encode_cell({ c: 2, r: 0 })] = { v: '3' };
        ws[XLSX.utils.encode_cell({ c: 3, r: 0 })] = { v: '4' };
        ws[XLSX.utils.encode_cell({ c: 4, r: 0 })] = { v: '5' };
        ws[XLSX.utils.encode_cell({ c: 5, r: 0 })] = { v: '6' };
        ws[XLSX.utils.encode_cell({ c: 6, r: 0 })] = { v: '7' };
        for(var i = 0 ; i < 4; i++){
            ws[XLSX.utils.encode_cell({ c: 0, r: i+1 })] = { v: time[i] };
            ws[XLSX.utils.encode_cell({ c: 1, r: i+1 })] = { v: sessions[i] };
            ws[XLSX.utils.encode_cell({ c: 2, r: i+1 })] = { v: sessions[i + 4*1] };
            ws[XLSX.utils.encode_cell({ c: 3, r: i+1 })] = { v: sessions[i + 4*2] };
            ws[XLSX.utils.encode_cell({ c: 4, r: i+1 })] = { v: sessions[i + 4*3] };
            ws[XLSX.utils.encode_cell({ c: 5, r: i+1 })] = { v: sessions[i + 4*4] };
            ws[XLSX.utils.encode_cell({ c: 6, r: i+1 })] = { v: sessions[i + 4*5] };
        }
        ws['!ref'] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: 6, r: course_list.length + 7 } });
        wb.Sheets[ws_name] = ws;
        var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: false, type: 'binary' });
        if (file_name == '') file_name = 'schedule';
        FileSaver.saveAs(new Blob([this.s2ab(wbout)], { type: "application/octet-stream" }), file_name + ".xlsx");
    }
}
