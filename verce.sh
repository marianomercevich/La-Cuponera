#!/bin/bash

source .env

if [[ $BRANCH_NAME == "Cupones"  ]] ; then 
    npm run build:cuponnes
elif [[ $BRANCH_NAME == "Usuarios"  ]] ; then
    npm run build:usuarios
elif [[ $BRANCH_NAME == "Vendedores"  ]] ; then
    npm run build:vendedores
else
    echo $BRANCH_NAME
    echo "BRANCH NOT MATCHED"
fi