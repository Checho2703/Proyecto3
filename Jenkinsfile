pipeline {
    agent any

    parameters {
        string(name: 'SERVICE_TO_DEPLOY', defaultValue: '', description: 'Nombre del servicio a desplegar (ej. frontend, backend1, new-service)')
        string(name: 'DOCKERHUB_IMAGE_NAME', defaultValue: '', description: 'Nombre completo de la imagen en Docker Hub (ej. user/repo:tag)')
        string(name: 'CONTAINER_PORT_MAPPING', defaultValue: '', description: 'Mapeo de puertos (ej. 80:80 o 3000:3000). Vacío si no se expone.')
        string(name: 'ENV_VARIABLES', defaultValue: '', description: 'Variables de entorno clave=valor separadas por coma (ej. API_KEY=xyz)')
        string(name: 'DOCKER_NETWORK_NAME', defaultValue: 'my_app_network', description: 'Nombre de la red Docker a usar.')
        booleanParam(name: 'IS_NEW_SERVICE', defaultValue: false, description: 'Marcar si es un servicio completamente nuevo (no existe el contenedor).')
    }

    environment {
        DOCKER_USER = 'grupomffsl'
        DOCKER_REPO = 'mis-servicios'
        DOCKER_PASS = credentials('grupomfifsl-dockerhub')

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
                stage('Validar parámetros') {
                    steps {
                        script {
                            if (params.SERVICE_TO_DEPLOY == '' || params.DOCKERHUB_IMAGE_NAME == '') {
                                error('Los parámetros SERVICE_TO_DEPLOY y DOCKERHUB_IMAGE_NAME son obligatorios.')
                            }
                        }
                    }
                }

                stage('Desplegar servicio Docker') {
                    steps {
                        script {
                            def portMapping = ''
                            if (params.CONTAINER_PORT_MAPPING) {
                                portMapping = "-p ${params.CONTAINER_PORT_MAPPING}"
                            }

                            def envVars = ''
                            if (params.ENV_VARIABLES) {
                                params.ENV_VARIABLES.split(',').each { pair ->
                                    envVars += "-e ${pair.trim()} "
                                }
                            }

                            def deployScript = """
                                #!/bin/bash
                                set -e

                                echo "--- Iniciando despliegue ---"
                                echo "Servicio: ${params.SERVICE_TO_DEPLOY}"
                                echo "Imagen: ${params.DOCKERHUB_IMAGE_NAME}"

                                echo "Verificando red Docker: ${params.DOCKER_NETWORK_NAME}"
                                sudo docker network inspect ${params.DOCKER_NETWORK_NAME} >/dev/null 2>&1 || sudo docker network create ${params.DOCKER_NETWORK_NAME}

                                MYSQL_HOST_IP=\$(sudo docker network inspect ${params.DOCKER_NETWORK_NAME} -f '{{(index .IPAM.Config 0).Gateway}}')
                                if [ -z "\$MYSQL_HOST_IP" ]; then
                                    MYSQL_HOST_IP=\$(ip -4 addr show eth0 | grep -oP '(?<=inet\\s)\\d+(\\.\\d+){3}' | head -1)
                                fi
                                echo "MySQL IP: \$MYSQL_HOST_IP"

                                if [ "${params.IS_NEW_SERVICE}" = "false" ]; then
                                    echo "Eliminando contenedor existente: ${params.SERVICE_TO_DEPLOY}"
                                    sudo docker stop ${params.SERVICE_TO_DEPLOY} || true
                                    sudo docker rm ${params.SERVICE_TO_DEPLOY} || true
                                else
                                    echo "Servicio nuevo, no se elimina contenedor anterior."
                                fi

                                echo "Haciendo pull de imagen: ${params.DOCKERHUB_IMAGE_NAME}"
                                sudo docker pull ${params.DOCKERHUB_IMAGE_NAME}

                                echo "Ejecutando contenedor..."
                                sudo docker run -d \\
                                    --name ${params.SERVICE_TO_DEPLOY} \\
                                    --network ${params.DOCKER_NETWORK_NAME} \\
                                    ${portMapping} \\
                                    ${envVars} \\
                                    -e DATABASE_HOST=\${MYSQL_HOST_IP} \\
                                    -e DATABASE_USER=${env.MYSQL_USER} \\
                                    -e DATABASE_PASSWORD=${env.MYSQL_PASSWORD} \\
                                    -e DATABASE_NAME=${env.MYSQL_DATABASE} \\
                                    ${params.DOCKERHUB_IMAGE_NAME}

                                echo "Limpiando imágenes viejas..."
                                sudo docker image prune -f

                                echo "Despliegue finalizado."
                            """

                            sh "sudo ${deployScript}"
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline terminado."
        }
        success {
            echo "Despliegue exitoso."
        }
        failure {
            echo "¡Despliegue fallido!"
        }
    }
}