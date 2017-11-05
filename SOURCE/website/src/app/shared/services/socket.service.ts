import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Subject } from 'rxjs';
@Injectable()
export class SocketService {
  public  socket: SocketIOClient.Socket; // The client instance of socket.io

  public invokeCheckAttendanceUpdated = new Subject();
  public invokeCheckAttendanceCreated = new Subject();
  public invokeCheckAttendanceStopped = new Subject();
  public invokeQuizStopped = new Subject();
  public invokeQuizAnswered = new Subject();
  // Constructor with an injection of ToastService
  public constructor() {
    this.socket = io();
  }

  // Emit: Check Attendance updated event
  public emitEventOnCheckAttendanceUpdated(checkAttendanceUpdated){
    this.socket.emit('checkAttendanceUpdated', checkAttendanceUpdated);
  }
  // Consume on Check Attendance updated 
  public consumeEventOnCheckAttendanceUpdated(){
    var self = this;
    this.socket.on('checkAttendanceUpdated', function(event:any){
      self.invokeCheckAttendanceUpdated.next(event);
    });
  }
  public stopEventOnCheckAttendanceUpdated(){
    this.socket.off('checkAttendanceUpdated');
  }

  // Emit: Check Attendance created event
  public emitEventOnCheckAttendanceCreated(checkAttendanceCreated){
    this.socket.emit('checkAttendanceCreated', checkAttendanceCreated);
  }
  // Consume on Check Attendance created 
  public consumeEventOnCheckAttendanceCreated(){
    var self = this;
    this.socket.on('checkAttendanceCreated', function(event:any){
      self.invokeCheckAttendanceCreated.next(event);
    });
  }
  public stopEventOnCheckAttendanceCreated(){
    this.socket.off('checkAttendanceCreated');
  }

  // Emit: Check Attendance created event
  public emitEventOnCheckAttendanceStopped(checkAttendanceStopped){
    this.socket.emit('checkAttendanceStopped', checkAttendanceStopped);
  }
  // Consume on Check Attendance stopped 
  public consumeEventOnCheckAttendanceStopped(){
    var self = this;
    this.socket.on('checkAttendanceStopped', function(event:any){
      self.invokeCheckAttendanceStopped.next(event);
    });
  }
  public stopEventOnCheckAttendanceStopped(){
    this.socket.off('checkAttendanceStopped');
  }

  public emitEventOnQuizStopped(quizStopped){
    this.socket.emit('quizStopped', quizStopped);
  }
  // Consume on Quiz stopped 
  public consumeEventOnQuizStopped(){
    var self = this;
    this.socket.on('quizStopped', function(event:any){
      self.invokeQuizStopped.next(event);
    });
  }
  public stopEventOnQuizStopped(){
    this.socket.off('quizStopped');
  }

  public emitEventOnQuizAnswered(quizAnswered){
    this.socket.emit('quizAnswered', quizAnswered);
  }
  // Consume on Quiz answered 
  public consumeEventOnQuizAnswered(){
    var self = this;
    this.socket.on('quizAnswered', function(event:any){
      self.invokeQuizAnswered.next(event);
    });
  }
  public stopEventOnQuizAnswered(){
    this.socket.off('quizAnswered');
  }
}