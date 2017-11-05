import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileUploader } from "ng2-file-upload/ng2-file-upload";
import { CourseService,TeacherService ,StudentService, AppService,ExcelService,ScheduleService  } from '../../shared.module';
declare var jQuery :any;
import * as FileSaver from 'file-saver';
import * as JSZip from 'jszip';

@Component({
    selector: 'export-modal',
    templateUrl: './export-modal.component.html',
})
export class ExportModalComponent implements OnInit {
    @Input() public title: string;
    @Input() public note: string;
    @Input() public export_type: number;
    @Input() public search_data: any;
    public constructor(public excelService: ExcelService, public appService: AppService, public studentService: StudentService,
        public teacherService: TeacherService, public courseService: CourseService,public scheduleService:ScheduleService) {}
    public ngOnInit() {}
    public classes = [];
    public programs = [];
    public class_has_course = [];
    public export_on_search = 1;
    public export_list = [];
    public export_progress = 0;
    public isExporting = false;
    public select_all_class = 0;
    public select_all_class_has_course = 0;
    public select_all_program = 0;
    public file_name = '';
    public onOpenModal() {
        this.file_name = '';
        this.export_progress = 0;
        this.export_on_search = 1;
        switch (this.export_type) {
            case this.appService.import_export_type.student:
            case this.appService.import_export_type.course:
            case this.appService.import_export_type.schedule:
                this.appService.getSemesterProgramClass().subscribe(result => {
                    this.classes = result.classes;
                    for (var i = 0; i < this.classes.length; i++) {
                        this.classes[i]['selected'] = false;
                    }
                    this.programs = result.programs;
                    for (var i = 0; i < this.programs.length; i++) {
                        this.programs[i]['selected'] = false;
                    }
                }, error => { this.appService.showPNotify('failure', "Server Error! Can't semester class program", 'error'); });
                break;
            case this.appService.import_export_type.teacher:

                break;
            case this.appService.import_export_type.examinees:
                this.export_on_search = 0;
                this.courseService.getClassHasCourse().subscribe(result => {
                    this.class_has_course = result.class_has_course;
                    for (var i = 0; i < this.class_has_course.length; i++) {
                        this.class_has_course[i]['selected'] = false;
                    }
                }, error => { this.appService.showPNotify('failure', "Server Error! Can't get class_has_course", 'error'); });
                break;
            default:
                // code...
                break;
        }
        
        jQuery("#exportModal").modal({ backdrop: 'static', keyboard: false });
    }
    public onSelectAllClass() {
        for (var i = 0; i < this.classes.length; i++) {
            this.classes[i]['selected'] = this.select_all_class;
        }
    }
    public onSelectAllClassHasCourse() {
        for (var i = 0; i < this.class_has_course.length; i++) {
            this.class_has_course[i]['selected'] = this.select_all_class_has_course;
        }
    }
    public onSelectAllProgram() {
        for (var i = 0; i < this.programs.length; i++) {
            this.programs[i]['selected'] = this.select_all_program;
        }
    }
    public onCancelExport() {
        this.isExporting = false;
        jQuery("#exportModal").modal("hide");
    }
    public onExport() {
        switch (this.export_type) {
            case this.appService.import_export_type.student:
                this.exportStudent();
                break;
            case this.appService.import_export_type.teacher:
                this.exportTeacher();
                break;
            case this.appService.import_export_type.course:
                this.exportCourse();
                break;
            case this.appService.import_export_type.schedule:
                this.exportSchedule();
                break;
            case this.appService.import_export_type.examinees:
                this.exportExaminees();
                break;
            default:
                // code...
                break;
        }
    }
    public onStopExport() {
        
    }

    public exportStudent(){
        if (!this.export_on_search) {
            var selected_classes = [];
            for (var i = 0; i < this.classes.length; i++) {
                if (this.classes[i].selected) {
                    selected_classes.push(this.classes[i].id);
                }
            }
            if (selected_classes.length == 0) {
                this.isExporting = false;
            } else {
                this.studentService.exportStudent(selected_classes).subscribe(result => {
                    var student_lists = result.student_lists;
                    this.excelService.writeStudentLists(student_lists);
                    this.isExporting = false;
                }, error => { this.appService.showPNotify('failure', "Server Error! Can't get student list", 'error') });
            }
        } else {
            this.studentService.getListStudents(this.search_data['program_id'], this.search_data['class_id'], this.search_data['status'], this.search_data['search_text'], 1, -1).subscribe(result => {
                var student_list = result.student_list;
                this.excelService.writeStudentSearchList(student_list, this.file_name);
                this.isExporting = false;
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't get student list", 'error') });
        }
    }
    public exportTeacher(){
        this.teacherService.getListTeachers(this.search_data['search_text'], 1, -1,this.search_data['sort_tag']).subscribe(result => {
            var teacher_list = result.teacher_list;
            this.excelService.writeTeacherSearchList(teacher_list, this.file_name);
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't get teacher list", 'error') });
    }
    public exportCourse(){
        if (!this.export_on_search) {
            var selected_classes = [];
            for (var i = 0; i < this.classes.length; i++) {
                if (this.classes[i].selected) {
                    selected_classes.push(this.classes[i].id);
                }
            }
            if (selected_classes.length == 0) {
                return;
            } else {
                this.courseService.exportCourse(selected_classes).subscribe(result => {
                    var course_lists = result.course_lists;
                    this.excelService.writeCourseLists(course_lists);
                }, error => { this.appService.showPNotify('failure', "Server Error! Can't get course lists", 'error') });
            }
        } else {
            this.courseService.getCourseLists(this.search_data['program_id'],this.search_data['class_id'],this.search_data['semester_id'],
                this.search_data['search_text']).subscribe(result => {
                var course_list = result.courses;
                this.excelService.writeCourseSearchList(course_list, this.file_name);
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't get course list", 'error') });
        }
    }
    public exportSchedule(){
        if (!this.export_on_search) {
            var selected_classes = [];
            var selected_programs = [];
            for (var i = 0; i < this.classes.length; i++) {
                if (this.classes[i].selected) {
                    selected_classes.push(this.classes[i].id);
                }
            }
            for (var i = 0; i < this.programs.length; i++) {
                if (this.programs[i].selected) {
                    selected_programs.push(this.programs[i].id);
                }
            }
            if (selected_classes.length == 0 && selected_programs.length == 0) {
                return;
            } else {
            }
        } else {
            this.scheduleService.getSchedulesAndCourses(this.search_data['program_id'],this.search_data['class_id'],this.search_data['semester_id'])
            .subscribe(result => {
                var courses = result.courses;
                this.excelService.writeScheduleSearchList(courses, this.file_name);
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't get schedule and courses", 'error'); });
        }
    }
    public exportExaminees(){
        var selected_class_has_course_id = [];
        var selected_class_has_course = [];
        for (var i = 0; i < this.class_has_course.length; i++) {
            if (this.class_has_course[i].selected) {
                selected_class_has_course_id.push(this.class_has_course[i].id);
                selected_class_has_course.push(this.class_has_course[i]);
            }
        }
        if (selected_class_has_course_id.length == 0) {
            return;
        } else {
            this.studentService.exportExaminees(selected_class_has_course_id).subscribe(result => {
                var examinees_lists = result.examinees_lists;
                this.excelService.writeExamineesLists(examinees_lists,selected_class_has_course);
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't get examinees lists", 'error') });
        }
    }
}
