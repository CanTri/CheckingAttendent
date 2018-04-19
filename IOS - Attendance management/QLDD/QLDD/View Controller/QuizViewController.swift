//
//  QuizViewController.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 1/29/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit
import Foundation
import KRActivityIndicatorView
import SocketIO


class QuizViewController: UIViewController {

    let dispathGroup = DispatchGroup()
    var quizCode = "" as String
    var token = UserDefaults.standard.string(forKey: "token")
    let manager = SocketManager(socketURL: URL(string: UserDefaults.standard.string(forKey: "HOST")!)!, config: [.log(true), .compress])
    
    var question_index = Int()
    var quizType = Int ()
    var quizTitle = String ()
    var quizTotal = Int ()
    
    var currentAnswer = [String]()
    var correctAnswer = [String]()
    
    var didQuiz = UserDefaults.standard.bool(forKey: "didQuiz")
    

    @IBOutlet weak var AnswerView: UIView!
    @IBOutlet weak var QuestionLabel: UILabel!
    //@IBOutlet weak var AnswerSegmentedControl: UISegmentedControl!
    @IBOutlet weak var NotiLabel: UILabel!
    @IBOutlet weak var CustomIndicatorView: KRActivityIndicatorView!
    @IBAction func ButtonATapped(_ sender: UIButton) {
        emitAnswer(option: "a")
        self.currentAnswer.append("A")
    }
    @IBAction func ButtonBTapped(_ sender: UIButton) {
        emitAnswer(option: "b")
        self.currentAnswer.append("B")
    }
    @IBAction func ButtonCTapped(_ sender: UIButton) {
        emitAnswer(option: "c")
        self.currentAnswer.append("C")
    }
    @IBAction func ButtonDTapped(_ sender: UIButton) {
        emitAnswer(option: "d")
        self.currentAnswer.append("D")
    }
//    @IBAction func AnswerSegmentedTap(_ sender: UISegmentedControl) {
//        switch AnswerSegmentedControl.selectedSegmentIndex {
//        case 0:
//            emitAnswer(option: "a")
//            self.currentAnswer.append("A")
//            break
//        case 1:
//            emitAnswer(option: "b")
//            self.currentAnswer.append("B")
//            break
//        case 2:
//            emitAnswer(option: "c")
//            self.currentAnswer.append("C")
//            break
//        case 3:
//            emitAnswer(option: "d")
//            self.currentAnswer.append("D")
//            break
//        default:
//            emitAnswer(option: "a")
//            self.currentAnswer.append("A")
//            break
//        }
//    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        //self.AnswerSegmentedControl.selectedSegmentIndex = -1
        
        NotiLabel.text = "Waiting for the quiz to start!"
        CustomIndicatorView.isLarge = true
        CustomIndicatorView.animating = true
        CustomIndicatorView.hidesWhenStopped = true
        CustomIndicatorView.style = .gradationColor(head: UIColor.red, tail: UIColor.yellow)
        
        setSocket()
        GetQuizTask()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        self.didQuiz = UserDefaults.standard.bool(forKey: "didQuiz")
        if didQuiz{
            UserDefaults.standard.set(false, forKey: "didQuiz");
            _ = self.navigationController?.popViewController(animated: true)
        }
    }
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        if let destination = segue.destination as? QuizResultViewController{
            destination.correctAnswer = self.correctAnswer
            destination.currentAnswer = self.currentAnswer
        }
    }
    
    func GetQuizTask(){
        let myUrl = NSURL(string: UserDefaults.standard.string(forKey: "HOST")! + "api/quiz/published");
        let request = NSMutableURLRequest(url: myUrl! as URL);
        request.httpMethod = "POST";
        request.addValue("application/json", forHTTPHeaderField: "content-type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        
        let postString = ["token": token, "quiz_code": self.quizCode] as? [String: Any]
        
        do{
            request.httpBody = try JSONSerialization.data(withJSONObject: postString, options: .prettyPrinted)
        } catch let error{
            print(error.localizedDescription)
            return
        }
        
        
        let task = URLSession.shared.dataTask(with: request as URLRequest){
            (data: Data?, response: URLResponse?, error: Error?) in
            if error != nil{
                print("error=\(error)")
                return
            }
            do {
                let json = try JSONSerialization.jsonObject(with: data!, options: .mutableContainers) as? NSDictionary
                if let parseJSON = json {
                    let resultValue = parseJSON["result"] as? String
                    print("result: \(resultValue)")
                    if (resultValue == "success"){
                        let quizConfig = parseJSON["quiz"] as? NSDictionary
                        let quizQuestion = quizConfig!["questions"] as? [[String:Any]]
                        self.quizType = quizConfig!["type"] as! Int
                        self.quizTitle = quizConfig!["title"] as! String
                        self.quizTotal = quizQuestion?.count as! Int
                        
                        for quizDetail in quizQuestion!{
                            let correct_option = quizDetail["correct_option"] as! String
                            //self.correctAnswer.append(correct_option)
                            var allAnswers = [String]()
                            allAnswers.append(quizDetail["option_a"] as! String)
                            allAnswers.append(quizDetail["option_b"] as! String)
                            allAnswers.append(quizDetail["option_c"] as! String)
                            allAnswers.append(quizDetail["option_d"] as! String)
                            
                            for (indexAns, answer) in allAnswers.enumerated(){
                                if correct_option == answer{
                                    switch indexAns{
                                    case 0:
                                        self.correctAnswer.append("A")
                                        break
                                    case 1:
                                        self.correctAnswer.append("B")
                                        break
                                    case 2:
                                        self.correctAnswer.append("C")
                                        break
                                    case 3:
                                        self.correctAnswer.append("D")
                                        break
                                    default:
                                        break
                                    }
                                }
                            }
                            
                        }
                        
                        
                    }
                    else if resultValue == "failure"{
                        var nmessage = parseJSON["message"] as! String
                        let alert = UIAlertController(title: "Error", message: nmessage, preferredStyle: .alert)
                        
                        alert.addAction(UIAlertAction(title: "Close", style: .cancel, handler: nil))
                        
                        self.present(alert, animated: true)
                    }
                }
            }catch {
                print("Error")
            }
            
        }
        task.resume()
    }
    
    func setSocket(){
        let socket = self.manager.defaultSocket
        
        socket.on(clientEvent: .connect) {data, ack in
            print("socket connected")
        }
        
//        socket.on("currentAmount") {data, ack in
//            guard let cur = data[0] as? Double else { return }
//
//            socket.emitWithAck("canUpdate", cur).timingOut(after: 0) {data in
//                socket.emit("update", ["amount": cur + 2.50])
//            }
//
//            ack.with("Got your currentAmount", "dude")
//        }
        
        socket.on("quizQuestionReady"){data, ack in
            let obj = data[0] as? NSDictionary
            let quiz_code = obj!["quiz_code"] as! String
            if quiz_code == self.quizCode{
                DispatchQueue.main.async { // Correct
                    self.NotiLabel.text = "Ready for the next question!"
                    self.CustomIndicatorView.style = .gradationColor(head: UIColor.blue, tail: UIColor.yellow)
                    //self.AnswerSegmentedControl.selectedSegmentIndex = -1
                }
            }
            
        }
        
        socket.on("quizQuestionLoaded"){data, ack in
            let obj = data[0] as? NSDictionary
            let quiz_code = obj!["quiz_code"] as! String
            if quiz_code == self.quizCode{
                self.question_index = obj!["question_index"] as! Int
                self.showAnswerTask()
            }
        }
        
        socket.on("quizQuestionEnded"){data, ack in
            self.AnswerView.isHidden = true
            self.showNotiView()
        }
        
        socket.on("quizStopped"){data, ack in
            let obj = data[0] as? NSDictionary
            let quiz_code = obj!["quiz_code"] as! String
            if quiz_code == self.quizCode{
                let alert = UIAlertController(title: "Attention", message: "Quiz stopped by teacher!", preferredStyle: .alert)
                
                alert.addAction(UIAlertAction(title: "Close", style: .cancel, handler: {action in
                    self.unsetSocket()
                    _ = self.navigationController?.popViewController(animated: true)
                }))
                
                
                self.present(alert, animated: true)
            }
        }
        
        socket.on("quizEnded"){data, ack in
            let obj = data[0] as? NSDictionary
            let quiz_code = obj!["quiz_code"] as! String
            if quiz_code == self.quizCode{
                if self.quizTotal == self.question_index + 1 {
                    self.showResultTask()
                }
                else{
                    let alert = UIAlertController(title: "Attention", message: "Quiz stopped by teacher!", preferredStyle: .alert)
                    
                    alert.addAction(UIAlertAction(title: "Close", style: .cancel, handler: {action in
                        self.unsetSocket()
                        _ = self.navigationController?.popViewController(animated: true)
                    }))
                    
                    
                    self.present(alert, animated: true)
                }
            }
        }
        
        socket.on(clientEvent: .disconnect) {data, ack in
            print("socket disconnected")
        }
        
        socket.connect()
    }
    func unsetSocket(){
        let socket = self.manager.defaultSocket
        socket.disconnect()
    }
    
    func hideNotiView(){
        self.NotiLabel.isHidden = true
        self.CustomIndicatorView.animating = false
    }
    
    func showNotiView(){
        self.NotiLabel.isHidden = false
        self.CustomIndicatorView.animating = true
    }
    
    func showAnswerTask(){
        self.hideNotiView()
        self.AnswerView.isHidden = false
        self.QuestionLabel.text = "Question " + String(self.question_index + 1) + "/" + String (self.quizTotal)
        
    }
    
    func showResultTask(){
        self.performSegue(withIdentifier: "quizToQuizResult", sender: self)
    }
    
    func emitAnswer(option: String){
        let socket = self.manager.defaultSocket
        let putString = ["quiz_code": self.quizCode, "question_index": self.question_index, "option": option, "student_id": UserDefaults.standard.string(forKey: "id")] as [String:Any]
        socket.emit("answeredQuiz", putString)
    }

}
