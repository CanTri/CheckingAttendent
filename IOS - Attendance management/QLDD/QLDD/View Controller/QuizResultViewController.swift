//
//  QuizResultViewController.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 1/31/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit

class QuizResultViewController: UIViewController, UITableViewDelegate, UITableViewDataSource {
    
    var currentAnswer = [String]()
    var correctAnswer = [String]()
    @IBOutlet weak var CorrectLabel: UILabel!
    @IBOutlet weak var CorrectDetailTableView: UITableView!
    
    let cellReuseIdentifier = "cell"
    override func viewDidLoad() {
        super.viewDidLoad()
        
        UpdateData()
        CorrectDetailTableView.dataSource = self
        CorrectDetailTableView.delegate = self
        
        UserDefaults.standard.set(true, forKey: "didQuiz");
        
        // Do any additional setup after loading the view.
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return correctAnswer.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        // create a new cell if needed or reuse an old one
        let cell:UITableViewCell = self.CorrectDetailTableView.dequeueReusableCell(withIdentifier: cellReuseIdentifier) as UITableViewCell!
        
        // set the text from the data model
        let index = indexPath.row
        var str = "Question " + String(index) + "\n"
        if index < self.currentAnswer.count{
            str += ">> Your answer:  " + self.currentAnswer[index] + "\n"
        }
        else{
            str += ">> Your answer:  " + "_" + "\n"
        }
        
        str += ">>> Correct answer:  " + self.correctAnswer[index] + "\n"
        cell.textLabel?.text = str
        cell.textLabel?.numberOfLines = 0
        
        return cell
    }
    
    func UpdateData(){
        var str = "Correct: "
        var totalCorrect = 0
        for (index, answer) in currentAnswer.enumerated(){
            if answer == correctAnswer[index]{
                totalCorrect += 1
            }
        }
        str += String(totalCorrect) + " out of " + String(self.correctAnswer.count)
        self.CorrectLabel.text = str
    }

    


}
