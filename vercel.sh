#!/bin/bash

source .env

if [[ $BRANCH_NAME == "Usuarios"  ]] ; then
    npm run build:usuarios
elif [[ $BRANCH_NAME == "Cupones"  ]] ; then 
    npm run build:cuponnes
elif [[ $BRANCH_NAME == "Empresas"  ]] ; then
    npm run build:empresas
else
    echo $BRANCH_NAME
    echo "BRANCH NOT MATCHED"
fi