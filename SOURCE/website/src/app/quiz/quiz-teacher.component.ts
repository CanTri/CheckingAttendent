import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { StudentService, AppService, CourseService,AuthService,QuizService } from '../shared/shared.module';
declare var jQuery: any;
@Component({
    selector: 'app-quiz-teacher',
    templateUrl: './quiz-teacher.component.html'
})
export class QuizTeacherComponent implements OnInit {
    public apiResult: string;
    public apiResultMessage: any;

    public courses: Array < any > = [];
    public selected_course;
    public selected_class_id;
    public quiz_list = [];
    public quiz = {
        id: 0,
        title: '',
        questions: [{
            text: '',
            answers: []
        }]
    };
    public deleting_quiz_id = 0;

    public constructor(public authService: AuthService, public courseService: CourseService, public  appService: AppService,
    public quizService: QuizService, public  studentService: StudentService, public  router: Router) {}

    public ngOnInit() {
        this.courseService.getTeachingCourses(this.authService.current_user.id).subscribe(result=>{
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if(this.apiResult == 'failure'){
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,'error');
            }
            this.courses = result.courses;
            this.selected_course = this.courses[0];
            this.loadQuiz();
        },error=>{this.appService.showPNotify('failure',"Server Error! Can't get teaching course",'error');});
    }

    public onChangeCourse() {
        this.loadQuiz();
    }

    public loadQuiz(){
        this.quizService.getQuizByCourseAndClass(this.selected_course['id'],this.selected_course['class_id']).subscribe(result=>{
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if(this.apiResult == 'failure'){
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,'error');
            }else{
                this.quiz_list = result.quiz_list;
                for(var i = 0 ; i < this.quiz_list.length; i++){
                    this.quiz_list[i]['isOpen'] = false;
                }
            }
        },error=>{this.appService.showPNotify('failure',"Server Error! Can't get quiz list",'error');});
    }
    public onAddQuiz(){
        jQuery('#addQuizModal').modal('show');
    }
    public addQuiz(){
        this.quizService.addQuiz(this.selected_course['id'],this.selected_course['class_id'],this.quiz).subscribe(result=>{
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if(this.apiResult == 'failure'){
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,'error');
            }else{
                this.loadQuiz();
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,'success');
                jQuery('#addQuizModal').modal('hide');
            }
        },error=>{this.appService.showPNotify('failure',"Server Error! Can't add quiz",'error');});
    }
    public onAddQuestion() {
        this.quiz.questions.push({
            text: '',
            answers: []
        });
    }
    public onRemoveQuestion(index: number) {
        for (var i = index; i < this.quiz.questions.length - 1; i++) {
            this.quiz.questions[i].text = this.quiz.questions[i + 1].text;
        }
        this.quiz.questions.pop();
    }
    public onDeleteQuiz(quiz_id){
        this.deleting_quiz_id = quiz_id;
        jQuery('#deleteQuizModal').modal('show');
    }
    public deleteQuiz(){
        this.quizService.deleteQuiz(this.deleting_quiz_id).subscribe(result=>{
            this.apiResult = result.result;
            this.apiResultMessage = result.message;
            if(this.apiResult == 'failure'){
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,'error');
            }else{
                this.loadQuiz();
                this.appService.showPNotify(this.apiResult,this.apiResultMessage,'success');
            }
        },error=>{this.appService.showPNotify('failure',"Server Error! Can't delete quiz",'error');});
    }
}
