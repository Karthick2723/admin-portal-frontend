pipeline {
    agent { label 'test' } // Specify the label of the slave node
    environment {
        NEXUS_CREDS = credentials('nexus')
        NEXUS_DOCKER_REPO = '192.168.0.74:8083'
    }
    stages {
        stage('Prepare Environment') {
            steps {
                script {
                    // Defining the GIT_SHORT_COMMIT variable within the environment block
                    env.GIT_SHORT_COMMIT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    echo "Current Git Short Commit: ${GIT_SHORT_COMMIT}"
                }
            }
        }
        stage('Docker Build') {
            steps {
                echo 'Building Docker Image'
                sh 'docker build --no-cache -t $NEXUS_DOCKER_REPO/adminui:${GIT_SHORT_COMMIT} .'
            }
        }
        stage('Docker Login') {
            steps {
                echo 'Nexus Docker Repository Login'
                withCredentials([usernamePassword(credentialsId: 'nexus', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh 'echo $PASS | docker login -u $USER --password-stdin $NEXUS_DOCKER_REPO'
                }
            }
        }
        stage('Docker Push') {
            steps {
                echo 'Pushing Image to Nexus hub'
                sh 'docker push $NEXUS_DOCKER_REPO/adminui:${GIT_SHORT_COMMIT}'
            }
        }
        stage('Remove Local Docker Image') {
            steps {
                catchError(buildResult: 'SUCCESS') {
                    sh 'docker rmi $NEXUS_DOCKER_REPO/adminui:${GIT_SHORT_COMMIT}'
                }
            }
        }
        stage('Prepare Deployment') {
            agent { label 'docker' }
            steps {
                echo 'Preparing for deployment'
                sh 'docker-compose -f docker-compose-dev.yml down'
                sh 'docker rmi $(docker images -q $NEXUS_DOCKER_REPO/adminui) || true'
            }
        }
        stage('Docker Pull') {
            agent { label 'docker' }
            steps {
                echo 'Pulling Image from Nexus'
                sh 'docker pull $NEXUS_DOCKER_REPO/adminui:${GIT_SHORT_COMMIT}'
            }
        }
        stage('Deploy dev') {
            agent { label 'docker' }
            steps {
                echo 'Deploying to dev environment'
                sh "docker-compose -f docker-compose-dev.yml ps"
                sh "docker-compose -f docker-compose-dev.yml down"
                sh "docker-compose -f docker-compose-dev.yml up --no-build --quiet-pull -d"
                sh "docker-compose -f docker-compose-dev.yml ps"
            }
        }
    }
}
