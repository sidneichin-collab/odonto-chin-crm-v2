#!/bin/bash
# Automatic Backup Script for Odonto Chin CRM
# Runs daily at 2 AM via cron

set -e

# Configuration
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="odonto_crm_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Database credentials
DB_HOST=${MYSQL_HOST:-mysql}
DB_PORT=${MYSQL_PORT:-3306}
DB_NAME=${MYSQL_DATABASE:-odonto_crm}
DB_USER=${MYSQL_USER:-odonto_user}
DB_PASS=${MYSQL_PASSWORD}

echo "[$(date)] Starting backup..."

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Perform database backup
mysqldump -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASS} \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    ${DB_NAME} | gzip > ${BACKUP_DIR}/${BACKUP_FILE}

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "[$(date)] Backup completed successfully: ${BACKUP_FILE}"
    
    # Get backup size
    BACKUP_SIZE=$(du -h ${BACKUP_DIR}/${BACKUP_FILE} | cut -f1)
    echo "[$(date)] Backup size: ${BACKUP_SIZE}"
else
    echo "[$(date)] ERROR: Backup failed!"
    exit 1
fi

# Remove old backups (older than RETENTION_DAYS)
echo "[$(date)] Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
find ${BACKUP_DIR} -name "odonto_crm_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete

# Count remaining backups
BACKUP_COUNT=$(find ${BACKUP_DIR} -name "odonto_crm_backup_*.sql.gz" -type f | wc -l)
echo "[$(date)] Total backups: ${BACKUP_COUNT}"

echo "[$(date)] Backup process completed!"
