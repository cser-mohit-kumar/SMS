// ============================================================
// Stationery Management System - Declarative Jenkins Pipeline
// ============================================================
// Prerequisites:
//   - Jenkins with Pipeline plugin
//   - Maven, JDK 17+, Docker & Docker Compose on the agent
// ============================================================

pipeline {
    agent any

    environment {
        JAVA_HOME = '/usr/lib/jvm/java-21-openjdk'
        MAVEN_HOME = '/usr/share/java/maven'
        PATH = "${JAVA_HOME}/bin:${MAVEN_HOME}/bin:/usr/local/bin:/usr/bin:/bin:${env.PATH}"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 25, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {

        // 1. Checkout Source Code
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        // 2. Build All Backend Services
        stage('Build Backend') {
            steps {
                echo 'Building all backend microservices...'
                sh 'mvn clean package -DskipTests -B'
            }
        }

        // 3. Run Backend Tests
        stage('Run Backend Tests') {
            steps {
                echo 'Running backend unit tests...'
                sh 'mvn test -B'
            }
            post {
                always {
                    junit allowEmptyResults: true,
                          testResults: '**/target/surefire-reports/*.xml'
                }
            }
        }

        // 4. Build Docker Images and Deploy
        stage('Docker Deploy') {
            steps {
                echo 'Stopping any existing containers...'
                sh 'docker-compose down --remove-orphans || true'

                echo 'Building images and starting containers...'
                sh 'docker-compose up -d --build'

                echo 'Waiting for services to become healthy...'
                sh 'sleep 60'

                echo 'Verifying deployment...'
                sh 'docker-compose ps'
            }
        }
    }

    post {
        success {
            echo '==========================================='
            echo '  Pipeline SUCCEEDED!'
            echo "  Build #${BUILD_NUMBER} deployed."
            echo '==========================================='
        }
        failure {
            echo '==========================================='
            echo '  Pipeline FAILED!'
            echo "  Check logs for build #${BUILD_NUMBER}."
            echo '==========================================='
        }
    }
}
