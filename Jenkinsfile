pipeline {
    agent any

    parameters {
        string(name: 'SERVICE_TO_DEPLOY', defaultValue: '', description: 'Nombre del servicio a desplegar (ej. frontend, backend1, new-service)')
        string(name: 'DOCKERHUB_IMAGE_NAME', defaultValue: '', description: 'Nombre completo de la imagen en Docker Hub (ej. user/repo:tag)')
        string(name: 'ENV_VARIABLES', defaultValue: '', description: 'Variables de entorno clave=valor separadas por coma (ej. API_KEY=xyz)')
        string(name: 'CONTAINER_PORT_MAPPING', defaultValue: '', description: 'Mapeo de puertos (ej. 8080:80)')
        string(name: 'DOCKER_NETWORK_NAME', defaultValue: 'my_app_network', description: 'Nombre de la red Docker a usar.')
        booleanParam(name: 'IS_NEW_SERVICE', defaultValue: false, description: 'Marcar si es un servicio completamente nuevo (no existe el contenedor).')
    }

    environment {
        DOCKER_USER = 'grupomfifsl'
        DOCKER_REPO = 'mis-servicios'
        DOCKER_PASS = credentials('grupomfifsl-dockerhub')

        MYSQL_HOST = '186.189.71.139'
        MYSQL_USER = 'samjoys'
        MYSQL_PASSWORD = credentials('bd_password')
        MYSQL_DATABASE = 'db_main'
    }
    
    stages {
        stage('Desplegar en PR a main') {
            when {
                changeRequest(target: 'main')
            }
            stages {
                stage('Desplegar servicio Docker') {
                    steps {
                        script {
                            def portMapping = params.CONTAINER_PORT_MAPPING ? "-p ${params.CONTAINER_PORT_MAPPING}" : ""
                            
                            def envVars = []
                            if (params.ENV_VARIABLES) {
                                params.ENV_VARIABLES.split(',').each { pair ->
                                    envVars << "-e ${pair.trim()}"
                                }
                            }
                            
                            // Comandos comunes
                            sh "docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}"
                            sh "docker pull ${params.DOCKERHUB_IMAGE_NAME}"
                            
                            if (!params.IS_NEW_SERVICE) {
                                sh "docker stop ${params.SERVICE_TO_DEPLOY} || true"
                                sh "docker rm ${params.SERVICE_TO_DEPLOY} || true"
                            }
                            
                            // Comandos específicos por servicio
                            switch(params.SERVICE_TO_DEPLOY) {
                                case 'frontend-service-latest':
                                    sh """
                                        docker run -d \\
                                        --name frontend_service \\
                                        -p 4200:80 \\
                                        ${envVars.join(' ')} \\
                                        ${params.DOCKERHUB_IMAGE_NAME}
                                    """
                                    break
                                case 'login-service-latest':
                                    sh """
                                        docker run -d \\
                                        --name login_service \\
                                        -p 3000:3000 \\
                                        -e DB_HOST=${MYSQL_HOST} \\
                                        -e DB_USER=${MYSQL_USER} \\
                                        -e DB_PASSWORD=${MYSQL_PASSWORD} \\
                                        -e DB_NAME=${MYSQL_DATABASE} \\
                                        ${envVars.join(' ')} \\
                                        ${params.DOCKERHUB_IMAGE_NAME}
                                    """
                                    break
                                case 'upload-service-latest':
                                    sh """
                                        docker run -d \\
                                        --name upload-service-latest \\
                                        -p 3001:3001 \\
                                        -e DB_HOST=${MYSQL_HOST} \\
                                        -e DB_USER=${MYSQL_USER} \\
                                        -e DB_PASSWORD=${MYSQL_PASSWORD} \\
                                        -e DB_NAME=${MYSQL_DATABASE} \\
                                        ${envVars.join(' ')} \\
                                        ${params.DOCKERHUB_IMAGE_NAME}
                                    """
                                    break
                                default:
                                    error "Servicio desconocido: ${params.SERVICE_TO_DEPLOY}"
                            }
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