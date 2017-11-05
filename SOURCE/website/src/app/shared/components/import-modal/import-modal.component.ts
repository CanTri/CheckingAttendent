import { Component, OnInit, Input, Output , EventEmitter} from '@angular/core';
import { FileUploader } from "ng2-file-upload/ng2-file-upload";
import { CourseService,TeacherService ,StudentService, AppService,ExcelService  } from '../../shared.module';
declare var jQuery: any;

@Component({
  selector: 'import-modal',
  templateUrl: './import-modal.component.html',
})
export class ImportModalComponent implements OnInit {
	@Input() public title : string;
    @Input() public note: string;
    @Input() public import_type: number;
    @Output() public onClose : EventEmitter<string> = new EventEmitter<string>();
    public constructor(public excelService : ExcelService,public appService : AppService,public studentService: StudentService,
        public teacherService:TeacherService, public courseService: CourseService) { }
    public ngOnInit() {
        this.import_progress = 0;
    }

    public import_list = [];
    public uploader: FileUploader = new FileUploader({ url: '' });
    public import_progress = 0;
    public isImporting = false;
    public onSelectFile(files : any){
        var file_list = Array.prototype.slice.call(files);
        for(var i = 0 ; i < file_list.length; i++){
            var _import = {
                file : file_list[i],
                result : '',
                result_message : ''
            }
            this.import_list.push(_import);
        }
    }
    public onRemoveFile(index : number){
        for(var i = index;i < this.import_list.length-1; i++){
            this.import_list[i].file = this.import_list[i+1].file;
            this.import_list[i].result = this.import_list[i+1].result;
        }
        this.import_list.pop();
    }
    public onRemoveAllFile(i : number){
        this.import_list = [];
        this.isImporting = false;
    }
    public onCancelImport(){
        this.isImporting = false;
        jQuery("#importModal").modal("hide");
        this.onClose.emit('close');
    }
    public onImport(){
        this.import_progress = 0;
        this.isImporting = true;
        if(this.import_list.length > 0){
            this.loopReadFile();
        }else{
            this.isImporting = false;
        }
    }
    public onStopImport(){
        this.isImporting = false;
    }
    public onOpenModal() {
        this.import_progress = 0;
        this.import_list = [];
        jQuery("#importModal").modal({backdrop: 'static', keyboard: false});
    }

    public loopReadFile(){
        if(this.import_progress == 100 || this.isImporting == false){
            this.isImporting = false;
            console.log('loop end');
            return;
        }
        else{
            setTimeout(() => {
                if(this.isImporting == false){
                    this.isImporting = false;
                    console.log('loop end');
                    return;
                }
                var file_index = this.import_progress / (100 / this.import_list.length);
                switch (this.import_type) {
                    case this.appService.import_export_type.student:
                        this.readStudentFile(file_index);
                        break;
                    case this.appService.import_export_type.teacher:
                        this.readTeacherFile(file_index);
                        break;
                    case this.appService.import_export_type.course:
                        this.readCourseFile(file_index);
                        break;
                    case this.appService.import_export_type.schedule:
                        break;
                    default:
                        break;
                }
            },2000);
        }
    }
    public readFileCallback(file_index,result){
        this.import_list[file_index].result = result.result;
        this.import_list[file_index].result_message = result.message;
        this.import_progress += 100 / this.import_list.length;
        this.loopReadFile();
    }
    public readStudentFile(file_index){
        this.excelService.readStudentListFile(this.import_list[file_index].file).subscribe(result => {
            if (result[0].result == 'failure') {
                this.readFileCallback(file_index,result[0]);
                return;
            }
            if (result[0].result == 'success') {
                var student_list = result[0].student_list.slice();
                var class_name = this.import_list[file_index].file['name'].split('.')[0];
                this.studentService.importStudent(class_name,student_list).subscribe(result=>{
                    this.readFileCallback(file_index,result);
                },error=>{
                    this.readFileCallback(file_index,{result:'failure',message:"Server error ! Can't import student"});
                });
            }
        }, error => {
            this.readFileCallback(file_index,{result:'failure',message:"Service error"});
        });
    }
    public readTeacherFile(file_index){
        this.excelService.readTeacherListFile(this.import_list[file_index].file).subscribe(result => {
            if (result[0].result == 'failure') {
                this.readFileCallback(file_index,result[0]);
                return;
            }
            if (result[0].result == 'success') {
                var teacher_list = result[0].teacher_list.slice();
                this.teacherService.importTeacher(teacher_list).subscribe(result=>{
                    this.readFileCallback(file_index,result);
                },error=>{
                    this.readFileCallback(file_index,{result:'failure',message:"Server error ! Can't import teacher"});
                });
            }
        }, error => {
            this.readFileCallback(file_index,{result:'failure',message:"Service error"});
        });
    }
    public readCourseFile(file_index){
        this.excelService.readCourseListFile(this.import_list[file_index].file).subscribe(result => {
            if (result[0].result == 'failure') {
                this.readFileCallback(file_index,result[0]);
                return;
            }
            if (result[0].result == 'success') {
                var course_list = result[0].course_list.slice();
                var class_name = this.import_list[file_index].file['name'].split('.')[0];
                this.courseService.importCourse(class_name,course_list).subscribe(result=>{
                    this.readFileCallback(file_index,result);
                },error=>{
                    this.readFileCallback(file_index,{result:'failure',message:"Server error ! Can't import course"});
                });
            }
        }, error => {
            this.readFileCallback(file_index,{result:'failure',message:"Service error"});
        });
    }
}