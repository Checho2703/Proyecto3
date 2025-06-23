pipeline {
    agent any
    
    environment {
        DOCKER_HUB_CREDENTIALS = credentials('grupomfifsl-dockerhub') // ID de las credenciales en Jenkins
        MYSQL_ROOT_PASSWORD = credentials('bd_password')
        MYSQL_DATABASE = 'microservices_db'
        MYSQL_HOST = 'localhost' // MySQL nativo en la misma instancia
        MYSQL_PORT = '3306'
        NETWORK_NAME = 'microservices-network'
    }
    
    triggers {
        // Escucha webhooks de GitHub para pull requests en main
        githubPush()
    }
    
    stages {
        stage('Verificar Pull Request') {
            when {
                anyOf {
                    branch 'main'
                    changeRequest target: 'main'
                }
            }
            steps {
                script {
                    echo "Pull Request detectado en rama main"
                    echo "Iniciando proceso de despliegue de microservicios"
                }
            }
        }
        
        stage('Preparar Entorno Docker') {
            steps {
                script {
                    // Limpiar contenedores anteriores de microservicios
                    sh '''
                        echo "Limpiando contenedores existentes de microservicios..."
                        docker stop upload-service list-service login-service subirpdf-service 2>/dev/null || true
                        docker rm upload-service list-service login-service subirpdf-service 2>/dev/null || true
                        
                        # Crear red si no existe
                        docker network ls | grep ${NETWORK_NAME} || docker network create ${NETWORK_NAME}
                    '''
                }
            }
        }
        
        stage('Verificar MySQL Nativo') {
            steps {
                script {
                    sh '''
                        echo "Verificando conexión a MySQL nativo..."
                        # Verificar que MySQL esté corriendo
                        sudo systemctl status mysql || sudo systemctl status mysqld
                        
                        # Verificar conexión
                        mysql -h${MYSQL_HOST} -P${MYSQL_PORT} -uroot -p${MYSQL_ROOT_PASSWORD} -e "SELECT 1;" || {
                            echo "Error: No se puede conectar a MySQL"
                            exit 1
                        }
                        
                        # Crear base de datos si no existe
                        mysql -h${MYSQL_HOST} -P${MYSQL_PORT} -uroot -p${MYSQL_ROOT_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE};"
                        echo "MySQL nativo verificado y base de datos preparada"
                    '''
                }
            }
        }
        
        stage('Pull y Deploy Microservicios') {
            parallel {
                stage('Upload Service') {
                    steps {
                        script {
                            sh '''
                                echo "Desplegando upload-service..."
                                docker pull grupomffsl/mis-servicios:upload-service-latest
                                docker run -d \
                                    --name upload-service \
                                    --network ${NETWORK_NAME} \
                                    --add-host=host.docker.internal:host-gateway \
                                    -p 3002:3002 \
                                    -e DB_HOST=host.docker.internal \
                                    -e DB_PORT=${MYSQL_PORT} \
                                    -e DB_NAME=${MYSQL_DATABASE} \
                                    -e DB_USER=root \
                                    -e DB_PASSWORD=${MYSQL_ROOT_PASSWORD} \
                                    grupomffsl/mis-servicios:upload-service-latest
                            '''
                        }
                    }
                }
                
                stage('List Service') {
                    steps {
                        script {
                            sh '''
                                echo "Desplegando list-service..."
                                docker pull grupomffsl/mis-servicios:list-service-latest
                                docker run -d \
                                    --name list-service \
                                    --network ${NETWORK_NAME} \
                                    --add-host=host.docker.internal:host-gateway \
                                    -p 3004:3004 \
                                    -e DB_HOST=host.docker.internal \
                                    -e DB_PORT=${MYSQL_PORT} \
                                    -e DB_NAME=${MYSQL_DATABASE} \
                                    -e DB_USER=root \
                                    -e DB_PASSWORD=${MYSQL_ROOT_PASSWORD} \
                                    grupomffsl/mis-servicios:list-service-latest
                            '''
                        }
                    }
                }
                
                stage('Login Service') {
                    steps {
                        script {
                            sh '''
                                echo "Desplegando login-service..."
                                docker pull grupomffsl/mis-servicios:login-service-latest
                                docker run -d \
                                    --name login-service \
                                    --network ${NETWORK_NAME} \
                                    --add-host=host.docker.internal:host-gateway \
                                    -p 3000:3000 \
                                    -e DB_HOST=host.docker.internal \
                                    -e DB_PORT=${MYSQL_PORT} \
                                    -e DB_NAME=${MYSQL_DATABASE} \
                                    -e DB_USER=root \
                                    -e DB_PASSWORD=${MYSQL_ROOT_PASSWORD} \
                                    grupomffsl/mis-servicios:login-service-latest
                            '''
                        }
                    }
                }
                
                stage('SubirPDF Service') {
                    steps {
                        script {
                            sh '''
                                echo "Desplegando subirpdf-service..."
                                docker pull grupomffsl/mis-servicios:subirpdf-service-latest
                                docker run -d \
                                    --name subirpdf-service \
                                    --network ${NETWORK_NAME} \
                                    --add-host=host.docker.internal:host-gateway \
                                    -p 3002:3002 \
                                    -e DB_HOST=host.docker.internal \
                                    -e DB_PORT=${MYSQL_PORT} \
                                    -e DB_NAME=${MYSQL_DATABASE} \
                                    -e DB_USER=root \
                                    -e DB_PASSWORD=${MYSQL_ROOT_PASSWORD} \
                                    grupomffsl/mis-servicios:subirpdf-service-latest
                            '''
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                // Limpiar imágenes no utilizadas
                sh 'docker image prune -f'
            }
        }
        
        success {
            echo 'Despliegue exitoso de microservicios!'
            // Opcional: enviar notificación de éxito
            slackSend(
                channel: '#deployments',
                color: 'good',
                message: "✅ Microservicios desplegados exitosamente en ${env.BUILD_URL}"
            )
        }
        
        failure {
            echo 'Error en el despliegue'
            // Rollback automático en caso de fallo
            sh '''
                echo "Iniciando rollback..."
                docker stop upload-service list-service login-service subirpdf-service 2>/dev/null || true
                docker rm upload-service list-service login-service subirpdf-service 2>/dev/null || true
            '''
            
            // Opcional: enviar notificación de error
            slackSend(
                channel: '#deployments',
                color: 'danger',
                message: "❌ Error en despliegue de microservicios: ${env.BUILD_URL}"
            )
        }
        
        cleanup {
            // Limpiar workspace
            cleanWs()
        }
    }
}