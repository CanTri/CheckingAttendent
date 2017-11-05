import { Component, OnInit,ViewChild } from '@angular/core';
import {  AppService, AuthService ,TeacherService,ExcelService,ExportModalComponent } from '../../shared/shared.module';
import { Router } from '@angular/router';
declare var jQuery: any;
@Component({
	selector: 'app-dashboard-staff',
	templateUrl: './dashboard-staff.component.html'
})
export class DashboardStaffComponent implements OnInit {

	public i = 0;
	public constructor(public  appService: AppService,public  excelService: ExcelService,public  authService: AuthService,
		public  teacherService: TeacherService,public  router : Router) {
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
            }, error => { this.appService.showPNotify('failure',"Server Error! Can't update profile",'error'); });
	}
	public onChangePassword(){
		this.router.navigate(['/change-password']);
	}
	public getSemesterProgramClass(){
		this.appService.getSemesterProgramClass().subscribe(results => {
            this.programs = results.programs;
            this.new_class_program = this.programs[this.programs.length - 1].id;
        }, error => { this.appService.showPNotify('failure',"Server Error! Can't get semester-program-class",'error'); });
	}
	public programs = [];
	public new_class_program;
	public ngOnInit() {
		this.editing_name = this.authService.current_user.first_name + ' ' + this.authService.current_user.last_name;
		jQuery('#from_to').daterangepicker(null, function(start, end, label) {

        });
	}

	public new_semester_name = '';
	public new_semester_vacation_time = '';
	public new_semester_start_date;
	public new_semester_end_date;
	public onAddSemester(){
		this.new_semester_name = '';
		this.new_semester_vacation_time = '';
		jQuery("#addSemesterModal").modal("show");
	}
	public confirmAddSemester(){
		this.new_semester_start_date = jQuery('#from_to').data('daterangepicker').startDate;
        this.new_semester_end_date = jQuery('#from_to').data('daterangepicker').endDate;
        this.appService.addSemester(this.new_semester_name,this.new_semester_start_date,this.new_semester_end_date,this.new_semester_vacation_time).subscribe(result=>{
        	this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if (result.result == 'success') {
                this.getSemesterProgramClass();
                this.new_semester_name = '';
				this.new_semester_vacation_time = '';
				this.new_semester_start_date = '';
				this.new_semester_end_date = '';
                jQuery("#addSemesterModal").modal("hide");
            }
        	this.appService.showPNotify(this.apiResult,this.apiResultMessage,this.apiResult == 'success' ? 'success' : 'error');
        },error=>{this.appService.showPNotify('failure',"Server Error! Can't add semester",'error');});
	}


	public new_program_name = '';
	public new_program_code = '';
	public onAddProgram(){
		this.new_program_name = '';
		this.new_program_code = '';
		jQuery("#addProgramModal").modal("show");
	}
	public confirmAddProgram(){
		this.appService.addProgram(this.new_program_name,this.new_program_code).subscribe(result=>{
        	this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if (result.result == 'success') {
                this.getSemesterProgramClass();
                this.new_program_name = '';
				this.new_program_code = '';
                jQuery("#addProgramModal").modal("hide");
            }
        	this.appService.showPNotify(this.apiResult,this.apiResultMessage,this.apiResult == 'success' ? 'success' : 'error');
        },error=>{this.appService.showPNotify('failure',"Server Error! Can't add class",'error');});
	}

	public new_class_name = '';
	public new_class_email = '';
	public new_student_list = [];
	public addStudentFromFile = '';
	public onSelectFile(file: any) {
        this.addStudentFromFile = file;
    }
    public onRemoveFile() {
        this.addStudentFromFile = '';
    }
    public onChangeNewClassName(){
    	this.new_class_email = this.new_class_name.toLowerCase() + '@student.hcmus.edu.vn';
    }
	public onAddClass(){
		this.new_class_name = '';
		this.new_class_program = 0;
		this.new_class_email = '@student.hcmus.edu.vn';
        this.getSemesterProgramClass();
		jQuery("#addClassModal").modal("show");
	}
	public confirmAddClass(){
		this.excelService.readStudentListFile(this.addStudentFromFile).subscribe(results => {
			var result = results[0];
			this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if (this.apiResult == 'success') {
                this.new_student_list = result.student_list.slice();
        		this.appService.addClass(this.new_class_name,this.new_class_email,this.new_class_program,this.new_student_list).subscribe(result=>{
		        	this.apiResult = result.result;
		            this.apiResultMessage = result.message;
		            if (result.result == 'success') {
		                this.getSemesterProgramClass();
		            }
			        this.appService.showPNotify(this.apiResult,this.apiResultMessage,this.apiResult == 'success' ? 'success' : 'error');
		        },error=>{this.appService.showPNotify('failure',"Server Error! Can't add class",'error');});
            }
        }, error => {this.appService.showPNotify('failure',"Server Error! Can't read student list file",'error');});
	}


	@ViewChild(ExportModalComponent)
    public  exportModal: ExportModalComponent;
	public onExportExamineesList(){
		this.exportModal.onOpenModal();
	}

	
	public keyDownFunction(event) {
      if(event.keyCode == 13) {
        this.onSaveEditProfile();
      }
    }
}

