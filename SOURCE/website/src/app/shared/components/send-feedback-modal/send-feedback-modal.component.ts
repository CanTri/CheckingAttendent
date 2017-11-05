import { Component, OnInit, Input, Output , EventEmitter} from '@angular/core';
import { FeedbackService } from '../../services/feedback.service';
import { AppService } from '../../services/app.service';
import { AuthService } from '../../services/auth.service';
declare var jQuery: any;

@Component({
  selector: 'send-feedback-modal',
  templateUrl: './send-feedback-modal.component.html',
})
export class SendFeedbackModalComponent implements OnInit {
	@Output() public onSent : EventEmitter<string> = new EventEmitter<string>();

    public isAnonymous = false;
    public title = '';
    public content = '';

    public apiResult: string;
    public apiResultMessage: string;
    public onOpenModal() {
        jQuery("#sendFeedbackModal").modal("show");
    }
    public onSendFeedback() {
        this.feedbackService.sendFeedbacks(this.title, this.content, this.isAnonymous).subscribe(result => {
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            this.appService.showPNotify(this.apiResult, this.apiResultMessage, this.apiResult == 'success' ? 'success' : 'error');
            if (this.apiResult == 'success') {
                this.isAnonymous = false;
                this.title = '';
                this.content = '';
                jQuery("#sendFeedbackModal").modal("hide");
                this.onSent.emit('success');
            }
        }, error => { this.appService.showPNotify('failure', "Server Error! Can't send feedbacks", 'error'); });
    }
	public constructor(public  feedbackService : FeedbackService,public  appService: AppService,public authService: AuthService) { }
	public ngOnInit() {
	}

}