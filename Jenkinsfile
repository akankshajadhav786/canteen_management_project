pipeline {
    agent any
    stages {
        stage('Pull from GitHub') {
            steps {
                checkout scm
            }
        }
        stage('Deploy to Nginx') {
            steps {
                bat 'xcopy /E /I /Y * C:\\nginx\\nginx\\html\\'
            }
        }
    }
}
