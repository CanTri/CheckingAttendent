import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import {  AppService, AuthService ,SocketService, AttendanceService , 
    SendFeedbackModalComponent, TeacherService, CourseService} from '../../shared/shared.module';
import { LocalStorageService } from 'angular-2-local-storage';
declare var jQuery:any;
@Component({
	selector: 'app-dashboard-teacher',
	templateUrl: './dashboard-teacher.component.html'
})
export class DashboardTeacherComponent implements OnInit, OnDestroy {

	public opening_attendances = [];

	constructor(public  router: Router,public  localStorage : LocalStorageService,public socketService: SocketService ,
        public  appService: AppService,public  authService: AuthService,public  attendanceService: AttendanceService, public  teacherService: TeacherService,public  courseService : CourseService) {
	    socketService.consumeEventOnCheckAttendanceCreated();
        socketService.invokeCheckAttendanceCreated.subscribe(result=>{
            this.getOpeningAttendance();
        });
        socketService.consumeEventOnCheckAttendanceStopped();
        socketService.invokeCheckAttendanceStopped.subscribe(result=>{
            this.getOpeningAttendance();
        });
    }
    public getOpeningAttendance(){
        this.attendanceService.getOpeningAttendanceCourse(this.authService.current_user.id).subscribe(result => {
            this.opening_attendances = result.opening_attendances;
                for(var j = 0 ; j < this.teaching_courses.length; j++){
                    this.teaching_courses[j]['is_opening_attendance'] = false;
                }
                for(var i = 0 ; i < this.opening_attendances.length; i++){
                    for(var j = 0 ; j < this.teaching_courses.length; j++){
                        if(this.opening_attendances[i].course_id == this.teaching_courses[j].id &&
                         this.opening_attendances[i].class_id == this.teaching_courses[j].class_id){
                            this.teaching_courses[j]['is_opening_attendance'] = true;
                        }
                    }
                }
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't get opening attendances", 'error'); });
    }
	public ngOnInit() {
		this.editing_name = this.authService.current_user.first_name + ' ' + this.authService.current_user.last_name;
		this.appService.getSemesterProgramClass().subscribe(results => {
            this.classes = results.classes;
            this.programs = results.programs;
            this.programs.unshift({id:0,name:"All programs"});
            this.selectedProgram = this.programs[0].id;
            this.onChangeProgram();
        }, error => {this.appService.showPNotify('failure',"Server Error! Can't get semester-program-class",'error');});
	}
    public ngOnDestroy(){
        this.socketService.stopEventOnCheckAttendanceStopped();
        this.socketService.stopEventOnCheckAttendanceCreated();
    }

	public isEditingProfile = false;
	public editing_name = '';
	public editing_phone = '';
	public editing_mail = '';

	public apiResult;
	public apiResultMessage;
	public onEditProfile(){
		this.isEditingProfile = true;
		this.editing_name = this.authService.current_user.first_name + ' ' + this.authService.current_user.last_name;
		this.editing_mail = this.authService.current_user.email;
		this.editing_phone = this.authService.current_user.phone;
	}
	public onCancelEditProfile(){
		this.isEditingProfile = false;
	}
	public onSaveEditProfile(){
		this.teacherService.updateTeacher(this.authService.current_user.id, this.editing_name, this.editing_mail, this.editing_phone)
            .subscribe(result => {
                this.apiResult = result.result;
                this.apiResultMessage = result.message;
                if (result.result == 'success') {
                    this.isEditingProfile = false;
                    this.authService.current_user.email = this.editing_mail;
                    this.authService.current_user.phone = this.editing_phone;
                }
                //this.resultMessageModal.onOpenModal();
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,this.apiResult == 'success' ? 'success' : 'error');
            }, error => { this.appService.showPNotify('failure',"Server Error! Can't update teacher",'error'); });
	}

    @ViewChild(SendFeedbackModalComponent)
    public  sendFeedbackModal: SendFeedbackModalComponent;
    public onSendFeedback() {
        this.sendFeedbackModal.onOpenModal();
    }
    public onFeedbackSent(result:string){}


    public search_text = '';
    public programs: Array < any > = [];
    public selectedProgram = 0;
    public classes: Array < any > = [];
    public filteredClasses: Array < any > ;
    public selectedClass = 0;
    public teaching_courses = [];
    public getTeachingList(){
    	this.courseService.getTeachingCourses(this.authService.current_user.id,this.search_text,this.selectedProgram,this.selectedClass).subscribe(result=>{
    		this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if(this.apiResult == 'failure'){
            	this.appService.showPNotify(this.apiResult,this.apiResultMessage,this.apiResult == 'success' ? 'success' : 'error');
            }
    		this.teaching_courses = result.courses;

			this.getOpeningAttendance();
    	},error=>{this.appService.showPNotify('failure',"Server Error! Can't get teaching course",'error');});
    }
    public onChangeProgram(){
    	this.filteredClasses = [{ id: 0, name: 'All Classes' }];
        for (var i = 0; i < this.classes.length; i++) {
            if (this.selectedProgram == 0 || this.classes[i].program_id == this.selectedProgram) {
                this.filteredClasses.push(this.classes[i]);
            }
        }
        this.selectedClass = this.filteredClasses[0].id;
        this.getTeachingList();
    }
    public onCourseClick(course_id: number){
    	this.router.navigate(['/courses/', course_id]);
    }

    public selected_course = {};
    public onCheckAttendance(event,course){
    	this.selected_course = course;
    	if(course.is_opening_attendance){
    		this.confirmAction();
    	}
    	else{
    		jQuery('#confirmModal').modal('show');
    	}
    }
    public confirmAction(){
    	this.localStorage.set('check_attendance_course_id',this.selected_course['id']);
        this.localStorage.set('check_attendance_class_id',this.selected_course['class_id']);
    	this.router.navigate(['/check-attendance']);
    }
    public onChangePassword(){
        this.router.navigate(['/change-password']);
    }
    public keyDownFunction(event) {
      if(event.keyCode == 13) {
        this.onSaveEditProfile();
      }
    }
}

