<?php


class Database extends PDO
{
    public function select($sql, $array = array(), $fetchMode = PDO::FETCH_ASSOC, $class = '')
    {
         // Append select if it isn't appended.
        if (strtolower(substr($sql, 0, 7)) !== 'select ') {
            $sql = "SELECT " . $sql;
        }
        
        $stmt = $this->prepare($sql);
        foreach ($array as $key => $value) {
            if (is_int($value)) {
                $stmt->bindValue("$key", $value, PDO::PARAM_INT);
            } else {
                $stmt->bindValue("$key", $value);
            }
        }
        $stmt->execute();
        if ($fetchMode === PDO::FETCH_CLASS) {
            return $stmt->fetchAll($fetchMode, $class);
        } else {
            return $stmt->fetchAll($fetchMode);
        }
    }

    public function insert($table, $data)
    {
        ksort($data);
        $fieldNames = implode(',', array_keys($data));
        $fieldValues = ':'.implode(', :', array_keys($data));
        $stmt = $this->prepare("INSERT INTO $table ($fieldNames) VALUES ($fieldValues)");
        foreach ($data as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }
        $stmt->execute();
        return $this->lastInsertId();
    }

    public function update($table, $data, $where)
    {
        ksort($data);
        $fieldDetails = null;
        foreach ($data as $key => $value) {
            $fieldDetails .= "$key = :$key,";
        }
        $fieldDetails = rtrim($fieldDetails, ',');
        $whereDetails = null;
        $i = 0;
        foreach ($where as $key => $value) {
            if ($i == 0) {
                $whereDetails .= "$key = :$key";
            } else {
                $whereDetails .= " AND $key = :$key";
            }
            $i++;
        }
        $whereDetails = ltrim($whereDetails, ' AND ');
        $stmt = $this->prepare("UPDATE $table SET $fieldDetails WHERE $whereDetails");
        foreach ($data as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }
        foreach ($where as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }
        $stmt->execute();
        return $stmt->rowCount();
    }

    public function delete($table, $where, $limit = 1)
    {
        ksort($where);
        $whereDetails = null;
        $i = 0;
        foreach ($where as $key => $value) {
            if ($i == 0) {
                $whereDetails .= "$key = :$key";
            } else {
                $whereDetails .= " AND $key = :$key";
            }
            $i++;
        }
        $whereDetails = ltrim($whereDetails, ' AND ');
        //if limit is a number use a limit on the query
        if (is_numeric($limit)) {
            $uselimit = "LIMIT $limit";
        }
        $stmt = $this->prepare("DELETE FROM $table WHERE $whereDetails $uselimit");
        foreach ($where as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }
        $stmt->execute();
        return $stmt->rowCount();
    }

    public function truncate($table)
    {
        return $this->exec("TRUNCATE TABLE $table");
    }
}