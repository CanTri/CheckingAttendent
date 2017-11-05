import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AppService, AttendanceService, AuthService, SocketService, AppConfig, CheckAttendanceService, QuizService } from '../../shared/shared.module';
import { LocalStorageService } from 'angular-2-local-storage';
declare var jQuery: any;
@Component({
    selector: 'check-attendance-quiz-student',
    templateUrl: './check-attendance-quiz-student.component.html'
})
export class CheckAttendanceQuizStudentComponent implements OnInit, OnDestroy {
    public stopped_modal_message;
    public constructor(public quizService: QuizService, public checkAttendanceService: CheckAttendanceService,
        public appConfig: AppConfig, public socketService: SocketService, public authService: AuthService,
        public attendanceService: AttendanceService, public localStorage: LocalStorageService, public appService: AppService,
        public router: Router) {
        socketService.consumeEventOnQuizStopped();
        socketService.invokeQuizStopped.subscribe(result => {
            if (this.quiz_id == result['quiz_id']) {
                this.stopped_modal_message = "Quiz is " + result['message'];
                jQuery('#quizStoppedModal').modal({ backdrop: 'static', keyboard: false });
                clearInterval(this.interval);
            }
        });
    }

    public apiResult;
    public apiResultMessage;
    public quiz_code_checked = false;
    public quiz_code = '';
    public quiz_id = 0;
    public quiz = {};
    public interval;
    public timer;
    public ngOnInit() {
        jQuery('#enterQuizCodeModal').modal({ backdrop: 'static', keyboard: false });
    }
    public ngOnDestroy() {
        this.socketService.stopEventOnQuizStopped();
    }
    public cancelCheckQuizCode() {
        jQuery("#enterQuizCodeModal").modal("hide");
        this.router.navigate(['/dashboard']);
    }
    public checkQuizCode() {
        this.quizService.checkQuizCode(this.quiz_code).subscribe(result => {
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if (this.apiResult == 'success') {
                this.quiz_code_checked = true;
                jQuery("#enterQuizCodeModal").modal("hide");
                this.quiz_id = result.quiz_id;
                this.getQuizDetail();
            } else {
                this.appService.showPNotify(this.apiResult, this.apiResultMessage, 'error');
            }
        }, error => {
            this.appService.showPNotify('failure', "Server Error! Can't check quiz code", 'error');
        });
    }
    public getQuizDetail() {
        this.quizService.getQuizDetail(this.quiz_id).subscribe(result => {
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if (this.apiResult == 'success') {
                this.quiz = result.quiz;
                for (var i = 0; i < this.quiz['questions'].length; i++) {
                    this.quiz['questions']['answer'] = '';
                }
                this.interval = setInterval(() => {
                    var time_left = (new Date(this.quiz['ended_at']).getTime() - new Date().getTime()) / 1000;
                    var second = Math.floor(time_left % 60);
                    var minute = Math.floor(time_left / 60);
                    if (second == 0 && minute == 0) {

                    }else{
                        this.timer = (minute > 9 ? minute : '0' + minute) + ':' + (second > 9 ? second : '0' + second);
                    }
                }, 1000);
            } else {
                this.appService.showPNotify(this.apiResult, this.apiResultMessage, 'error');
            }
        }, error => {
            this.appService.showPNotify('failure', "Server Error! Can't get quiz detail", 'error');
        });
    }
    public onCancelQuiz() {
        jQuery('#confirmCancelQuizModal').modal('show');
    }
    public cancelQuiz() {
        this.router.navigate(['/dashboard']);
    }
    public onSubmitQuiz() {
        jQuery('#confirmSubmitQuizModal').modal('show');
    }
    public submitQuiz() {
        this.quizService.submitQuiz(this.authService.current_user.id, this.quiz).subscribe(result => {
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if (this.apiResult == 'success') {
                this.socketService.emitEventOnQuizAnswered({ quiz_id: this.quiz_id });
                this.appService.showPNotify(this.apiResult, 'Submit successfully ! Directing to dashboard...', 'success');
                this.router.navigate(['/dashboard']);
            } else {
                this.appService.showPNotify(this.apiResult, this.apiResultMessage, 'error');
            }
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't submit quiz", 'error'); });
    }
}
