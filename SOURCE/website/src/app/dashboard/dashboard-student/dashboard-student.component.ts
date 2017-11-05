import { Component, OnInit, ViewChild } from '@angular/core';
import {  AppService, AuthService , CreateAbsenceRequestModalComponent , SendFeedbackModalComponent, StudentService, AttendanceService} from '../../shared/shared.module';
import { Router, ActivatedRoute, Params } from '@angular/router';
@Component({
	selector: 'app-dashboard-student',
	templateUrl: './dashboard-student.component.html'
})
export class DashboardStudentComponent implements OnInit {

	//public htmlContent: string = null;
	public userType: number = null;

	public role: object = null;

	public constructor(public  appService: AppService,public  authService: AuthService, public  studentService: StudentService,
		public  attendanceService: AttendanceService, public  router: Router) {
	}

	public attendance_list_by_student : Array<any> = [];

	public ngOnInit() {
		this.editing_name = this.authService.current_user.first_name + ' ' + this.authService.current_user.last_name;
		this.attendanceService.getAttendanceListByStudent(this.authService.current_user.id).subscribe(result=>{
			this.attendance_list_by_student = result.attendance_list_by_student;
			for(var i = 0; i < this.attendance_list_by_student.length;i++){
				var absences = 0;
				for(var j = 0 ; j < this.attendance_list_by_student[i].attendance_details.length; j++){
					if(this.attendance_list_by_student[i].attendance_details[j].attendance_type == this.appService.attendance_type.absent){
						absences++;
					}
				}
				this.attendance_list_by_student[i]['absences'] = absences;
			}
		},error => { this.appService.showPNotify('failure', "Server Error! Can't get attendance progression", 'error'); });
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
		this.studentService.updateStudent(this.authService.current_user.id, this.editing_name, this.editing_mail, this.editing_phone,null)
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
            }, error => { this.appService.showPNotify('failure', "Server Error! Can't edit profile", 'error'); });
	}

	@ViewChild(CreateAbsenceRequestModalComponent)
    public  createAbsenceRequestModal: CreateAbsenceRequestModalComponent;
    public onCreateAbsenceRequest() {
        this.createAbsenceRequestModal.onOpenModal();
    }
    public onRequestCreated(result:string){}

    @ViewChild(SendFeedbackModalComponent)
    public  sendFeedbackModal: SendFeedbackModalComponent;
    public onSendFeedback() {
        this.sendFeedbackModal.onOpenModal();
    }
    public onFeedbackSent(result:string){}

    public onChangePassword(){
        this.router.navigate(['/change-password']);
    }
    public keyDownFunction(event) {
      if(event.keyCode == 13) {
        this.onSaveEditProfile();
      }
    }
}

