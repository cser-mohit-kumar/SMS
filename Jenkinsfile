// ============================================================
// Stationery Management System - Declarative Jenkins Pipeline
// ============================================================
// Prerequisites:
//   - Jenkins with Pipeline plugin
//   - Maven 3.9+ configured as 'Maven-3.9' in Global Tool Config
//   - JDK 17 configured as 'JDK-17' in Global Tool Config
//   - Node.js 18+ configured as 'NodeJS-18' via NodeJS plugin
//   - Docker & Docker Compose installed on Jenkins agent
// ============================================================

pipeline {
    agent any

    tools {
        maven 'Maven-3.9'
        jdk 'JDK-17'
        nodejs 'NodeJS-18'
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
                echo 'Scouting and checking out source code...'
                checkout scm
            }
        }

        // 2. Build Backend Services (Parallel)
        stage('Build Backend') {
            parallel {
                stage('Config Server') {
                    steps {
                        dir('config-server') {
                            echo 'Building Config Server...'
                            sh 'mvn clean package -DskipTests -B'
                        }
                    }
                }
                stage('Eureka Server') {
                    steps {
                        dir('eureka-server') {
                            echo 'Building Eureka Server...'
                            sh 'mvn clean package -DskipTests -B'
                        }
                    }
                }
                stage('API Gateway') {
                    steps {
                        dir('api-gateway') {
                            echo 'Building API Gateway...'
                            sh 'mvn clean package -DskipTests -B'
                        }
                    }
                }
                stage('Auth Service') {
                    steps {
                        dir('auth-service') {
                            echo 'Building Auth Service...'
                            sh 'mvn clean package -DskipTests -B'
                        }
                    }
                }
                stage('Inventory Service') {
                    steps {
                        dir('inventory-service') {
                            echo 'Building Inventory Service...'
                            sh 'mvn clean package -DskipTests -B'
                        }
                    }
                }
                stage('Request Service') {
                    steps {
                        dir('request-service') {
                            echo 'Building Request Service...'
                            sh 'mvn clean package -DskipTests -B'
                        }
                    }
                }
            }
        }

        // 3. Run Backend Tests (Parallel)
        stage('Run Backend Tests') {
            parallel {
                stage('Auth Service Tests') {
                    steps {
                        dir('auth-service') {
                            echo 'Running Auth Service tests...'
                            sh 'mvn test -B'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'auth-service/target/surefire-reports/*.xml'
                        }
                    }
                }
                stage('Inventory Service Tests') {
                    steps {
                        dir('inventory-service') {
                            echo 'Running Inventory Service tests...'
                            sh 'mvn test -B'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'inventory-service/target/surefire-reports/*.xml'
                        }
                    }
                }
                stage('Request Service Tests') {
                    steps {
                        dir('request-service') {
                            echo 'Running Request Service tests...'
                            sh 'mvn test -B'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'request-service/target/surefire-reports/*.xml'
                        }
                    }
                }
            }
        }

        // 4. Build Frontend
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    echo 'Installing frontend dependencies...'
                    sh 'npm ci'
                    echo 'Building frontend production bundle...'
                    sh 'npm run build'
                }
            }
        }

        // 5. Run Frontend Tests
        stage('Frontend Tests') {
            steps {
                dir('frontend') {
                    echo 'Running frontend tests...'
                    sh 'npm test -- --watchAll=false --ci'
                }
            }
        }

        // 6. Build and Deploy Local Docker Containers
        stage('Docker Deploy') {
            steps {
                echo '🐳 Rebuilding and starting Docker containers...'
                sh 'docker-compose down --remove-orphans'
                sh 'docker-compose up -d --build'
                
                echo '⏳ Waiting for services to initialize...'
                sh 'sleep 45'
                
                echo '✅ Verifying deployment status...'
                sh 'docker-compose ps'
            }
        }
    }

    post {
        success {
            echo '✅ ========================================='
            echo '✅ Pipeline SUCCEEDED!'
            echo '✅ Build #${BUILD_NUMBER} deployed successfully.'
            echo '✅ ========================================='
        }
        failure {
            echo '❌ ========================================='
            echo '❌ Pipeline FAILED!'
            echo '❌ Check logs for build #${BUILD_NUMBER}.'
            echo '❌ ========================================='
        }
    }
}
